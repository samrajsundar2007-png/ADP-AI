import numpy as np
import pandas as pd


def safe_round(value, digits=2):
    try:
        if pd.isna(value):
            return 0
        return round(float(value), digits)
    except Exception:
        return 0


def clean_text(value):
    return str(value).strip().lower()


def normalize_dataframe(df: pd.DataFrame):
    clean_df = df.copy()
    clean_df.columns = [str(column).strip() for column in clean_df.columns]
    return clean_df


def extract_feature_importance(model_result):
    if not model_result:
        return []

    feature_importance = model_result.get("feature_importance")

    if isinstance(feature_importance, list):
        return feature_importance[:10]

    chart_data = model_result.get("chart_data", {})
    labels = chart_data.get("labels", [])
    values = chart_data.get("values", [])

    importance_list = []

    for label, value in zip(labels, values):
        importance_list.append(
            {
                "feature": str(label),
                "importance": safe_round(value, 6),
            }
        )

    importance_list = sorted(
        importance_list,
        key=lambda item: item["importance"],
        reverse=True,
    )

    return importance_list[:10]


def find_matching_column(df: pd.DataFrame, feature_name: str):
    feature_clean = clean_text(feature_name)

    for column in df.columns:
        column_clean = clean_text(column)

        if feature_clean == column_clean:
            return column

        if column_clean in feature_clean:
            return column

        if feature_clean in column_clean:
            return column

    return None


def build_data_quality_recommendations(df: pd.DataFrame):
    recommendations = []

    total_rows = len(df)
    total_columns = len(df.columns)
    total_cells = max(total_rows * total_columns, 1)

    total_missing = int(df.isnull().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    missing_percentage = (total_missing / total_cells) * 100
    duplicate_percentage = (duplicate_rows / max(total_rows, 1)) * 100

    if total_missing > 0:
        recommendations.append(
            f"Data quality: {safe_round(missing_percentage)}% values are missing. Fill important missing values before final prediction."
        )
    else:
        recommendations.append(
            "Data quality: No major missing values found in the uploaded dataset."
        )

    if duplicate_rows > 0:
        recommendations.append(
            f"Remove {duplicate_rows} duplicate rows because duplicate records can reduce prediction reliability."
        )
    else:
        recommendations.append(
            "No duplicate rows found, so the dataset is suitable for prediction analysis."
        )

    if duplicate_percentage > 10:
        recommendations.append(
            "Duplicate percentage is high. Clean repeated records before making important decisions."
        )

    return recommendations


def build_numeric_target_recommendations(
    df: pd.DataFrame,
    target_column: str,
    top_features: list,
):
    recommendations = []

    target_values = pd.to_numeric(
        df[target_column],
        errors="coerce",
    ).dropna()

    if target_values.empty:
        return recommendations

    target_mean = safe_round(target_values.mean())
    target_median = safe_round(target_values.median())
    target_min = safe_round(target_values.min())
    target_max = safe_round(target_values.max())

    recommendations.append(
        f"Target analysis: Average {target_column} is {target_mean}, median is {target_median}, minimum is {target_min}, and maximum is {target_max}."
    )

    for item in top_features[:5]:
        feature_name = item.get("feature")
        importance = item.get("importance", 0)

        matched_column = find_matching_column(df, feature_name)

        if not matched_column:
            continue

        if matched_column == target_column:
            continue

        if pd.api.types.is_numeric_dtype(df[matched_column]):
            feature_values = pd.to_numeric(
                df[matched_column],
                errors="coerce",
            )

            target_values = pd.to_numeric(
                df[target_column],
                errors="coerce",
            )

            temp_df = pd.DataFrame(
                {
                    "feature": feature_values,
                    "target": target_values,
                }
            ).dropna()

            if len(temp_df) < 5:
                continue

            correlation = temp_df["feature"].corr(temp_df["target"])

            if pd.isna(correlation):
                continue

            correlation = safe_round(correlation, 3)

            if correlation > 0:
                recommendations.append(
                    f"High priority: Improve '{matched_column}' because it has a positive relationship with {target_column}. Random Forest importance is {safe_round(importance * 100)}%."
                )

            elif correlation < 0:
                recommendations.append(
                    f"Control '{matched_column}' because higher values may reduce {target_column}. Correlation detected is {correlation}."
                )

            else:
                recommendations.append(
                    f"Monitor '{matched_column}' because Random Forest selected it as an important feature."
                )

        else:
            temp_df = df[[matched_column, target_column]].copy()
            temp_df[target_column] = pd.to_numeric(
                temp_df[target_column],
                errors="coerce",
            )
            temp_df = temp_df.dropna()

            if len(temp_df) < 5:
                continue

            group_result = (
                temp_df.groupby(matched_column)[target_column]
                .mean()
                .sort_values(ascending=False)
            )

            if len(group_result) > 0:
                best_group = group_result.index[0]
                best_value = safe_round(group_result.iloc[0])

                recommendations.append(
                    f"Best performing group in '{matched_column}' is '{best_group}' with average {target_column} of {best_value}. Follow patterns from this group."
                )

    return recommendations


def build_categorical_target_recommendations(
    df: pd.DataFrame,
    target_column: str,
    top_features: list,
):
    recommendations = []

    target_counts = df[target_column].value_counts()

    if len(target_counts) > 0:
        majority_class = str(target_counts.index[0])
        majority_count = int(target_counts.iloc[0])

        recommendations.append(
            f"Classification analysis: Most common class in '{target_column}' is '{majority_class}' with {majority_count} records."
        )

    for item in top_features[:5]:
        feature_name = item.get("feature")
        importance = item.get("importance", 0)

        matched_column = find_matching_column(df, feature_name)

        if not matched_column:
            continue

        if matched_column == target_column:
            continue

        recommendations.append(
            f"High priority: '{matched_column}' strongly influences '{target_column}'. Random Forest importance is {safe_round(importance * 100)}%."
        )

    return recommendations


def build_domain_recommendations(df: pd.DataFrame, target_column: str):
    recommendations = []

    target_lower = clean_text(target_column)

    columns_lower = []

    for column in df.columns:
        columns_lower.append(clean_text(column))

    joined_columns = " ".join(columns_lower)

    if "cgpa" in target_lower or "gpa" in target_lower:
        recommendations.append(
            "CGPA plan: To maintain 8 CGPA, keep every subject above the current average and avoid low internal marks."
        )

        recommendations.append(
            "CGPA improvement: To move from 8 to 9 CGPA, first focus on the lowest scoring subjects because weak subjects pull the average down."
        )

        if "attendance" in joined_columns:
            recommendations.append(
                "Attendance strategy: Keep attendance above 85% to 90% because it supports internal marks and final academic performance."
            )

        if "internal" in joined_columns or "assessment" in joined_columns:
            recommendations.append(
                "Internal marks strategy: Target high internal assessment marks because they improve final semester performance before exams."
            )

        if "lab" in joined_columns or "practical" in joined_columns:
            recommendations.append(
                "Practical strategy: Score strongly in labs and practicals because they can be improved with regular practice."
            )

        recommendations.append(
            "Study strategy: Use weekly revision, previous year questions, and weak-topic tracking to improve from 8 CGPA to 9 CGPA."
        )

    elif "mark" in target_lower or "score" in target_lower:
        recommendations.append(
            "Marks improvement: Identify low scoring topics first and revise them using daily short practice sessions."
        )

        recommendations.append(
            "Subject strategy: Compare subject-wise marks and spend more time on subjects below average."
        )

    elif "sales" in target_lower or "revenue" in target_lower or "amount" in target_lower:
        recommendations.append(
            "Sales improvement: Focus on customer segments, products, or regions with higher revenue contribution."
        )

        recommendations.append(
            "Growth strategy: Increase campaigns for high-performing products and improve weak-performing categories."
        )

    elif "placement" in target_lower or "placed" in target_lower or "job" in target_lower:
        recommendations.append(
            "Placement improvement: Focus on skills, projects, internships, aptitude score, and interview performance."
        )

        recommendations.append(
            "Student action plan: Improve resume projects, coding practice, communication, and mock interview performance."
        )

    elif "churn" in target_lower:
        recommendations.append(
            "Churn reduction: Focus on customers with low satisfaction, low engagement, or repeated complaints."
        )

        recommendations.append(
            "Retention strategy: Give personalized offers to high-risk customers detected by the prediction model."
        )

    elif "satisfaction" in target_lower or "rating" in target_lower:
        recommendations.append(
            "Satisfaction improvement: Improve the top service factors detected by Random Forest feature importance."
        )

        recommendations.append(
            "Feedback strategy: Focus on weak feedback areas first because they directly affect customer satisfaction."
        )

    else:
        recommendations.append(
            f"Improvement plan: Focus on the top important features that influence '{target_column}' because they have the strongest impact on prediction."
        )

    return recommendations


def build_goal_recommendations(df: pd.DataFrame, target_column: str):
    recommendations = []

    target_lower = clean_text(target_column)

    if not pd.api.types.is_numeric_dtype(df[target_column]):
        return recommendations

    target_values = pd.to_numeric(
        df[target_column],
        errors="coerce",
    ).dropna()

    if target_values.empty:
        return recommendations

    current_average = safe_round(target_values.mean())

    if "cgpa" in target_lower or "gpa" in target_lower:
        recommendations.append(
            f"Your current average CGPA from the dataset is around {current_average}. First maintain consistency above this level in every semester."
        )

        if current_average < 9:
            gap = safe_round(9 - current_average)

            recommendations.append(
                f"To reach 9 CGPA, improve approximately {gap} points. Focus on weak subjects, internals, attendance, and practical scores."
            )

        else:
            recommendations.append(
                "You are already near or above 9 CGPA. Maintain consistency and avoid score drops in upcoming semesters."
            )

    return recommendations


def generate_recommendations(
    df: pd.DataFrame,
    target_column: str,
    model_result: dict = None,
):
    df = normalize_dataframe(df)

    if target_column not in df.columns:
        return {
            "recommendations": [
                f"Target column '{target_column}' was not found, so recommendation analysis could not be completed."
            ],
            "recommendation_sections": {
                "data_quality": [],
                "target_analysis": [],
                "domain_strategy": [],
                "goal_strategy": [],
            },
        }

    top_features = extract_feature_importance(model_result)

    data_quality_recommendations = build_data_quality_recommendations(df)

    if pd.api.types.is_numeric_dtype(df[target_column]):
        target_recommendations = build_numeric_target_recommendations(
            df,
            target_column,
            top_features,
        )
    else:
        target_recommendations = build_categorical_target_recommendations(
            df,
            target_column,
            top_features,
        )

    domain_recommendations = build_domain_recommendations(
        df,
        target_column,
    )

    goal_recommendations = build_goal_recommendations(
        df,
        target_column,
    )

    final_recommendations = []

    final_recommendations.extend(data_quality_recommendations)
    final_recommendations.extend(target_recommendations)
    final_recommendations.extend(domain_recommendations)
    final_recommendations.extend(goal_recommendations)

    cleaned_recommendations = []

    for recommendation in final_recommendations:
        if recommendation not in cleaned_recommendations:
            cleaned_recommendations.append(recommendation)

    return {
        "recommendations": cleaned_recommendations[:12],
        "recommendation_sections": {
            "data_quality": data_quality_recommendations,
            "target_analysis": target_recommendations,
            "domain_strategy": domain_recommendations,
            "goal_strategy": goal_recommendations,
        },
    }
