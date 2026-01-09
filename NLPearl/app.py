from flask import Flask, render_template, request
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)

#Load the course list and similarity matrix
try:
    similarity = pickle.load(open('models/similarity.pkl', 'rb'))
    course_list_dicts = pickle.load(open('models/course_list.pkl', 'rb'))
    courses_df = pickle.load(open('models/courses.pkl', 'rb'))
except FileNotFoundError:
    print("Error: One or more files not found. Make sure 'models/similarity.pkl', 'models/course_list.pkl', and 'models/courses.pkl' exist.")
    exit()
except Exception as e:
    print(f"Error loading files: {e}")
    exit()

course_names = courses_df['course_name'].values.tolist()
course_url_dict = courses_df.set_index('course_name')['course_url'].to_dict()

def recommend(course_name):
    if course_name not in courses_df['course_name'].values:
        return []

    try:
        index = courses_df[courses_df['course_name'] == course_name].index[0]
        distances = sorted(list(enumerate(similarity[index])), reverse=True, key=lambda x: x[1])
        recommended_courses = []
        for i in distances[1:7]:
            recommended_name = courses_df.iloc[i[0]].course_name
            recommended_url = courses_df.iloc[i[0]].course_url
            # Create a more detailed course object
            course_info = {
                'name': recommended_name,
                'url': recommended_url,
                'description': f"Comprehensive course covering {recommended_name.split()[0] if recommended_name.split() else 'key'} concepts and practical applications."
            }
            recommended_courses.append(course_info)
        return recommended_courses

    except IndexError:
        return []
    except Exception as e:
        print(f"Error during recommendation: {e}")
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recommend', methods=['GET', 'POST'])
def ask_course():
    recommended_courses = []
    selected_course = None
    error_message = None
    
    if request.method == 'POST':
        selected_course = request.form.get('topic', '').strip()
        if selected_course:
            # Find closest matching course name
            closest_match = None
            for course in course_names:
                if selected_course.lower() in course.lower() or course.lower() in selected_course.lower():
                    closest_match = course
                    break
            
            if closest_match:
                recommended_courses = recommend(closest_match)
            else:
                # Try partial matching
                for course in course_names:
                    words = selected_course.lower().split()
                    if any(word in course.lower() for word in words if len(word) > 2):
                        closest_match = course
                        break
                
                if closest_match:
                    recommended_courses = recommend(closest_match)
                else:
                    error_message = "No matching courses found. Try different keywords."
        else:
            error_message = "Please enter a topic or learning goal."
    
    return render_template('ask_course.html', 
                         recommendations=recommended_courses, 
                         selected_course=selected_course,
                         error_message=error_message)

if __name__ == '__main__':
    app.run(debug=True)
