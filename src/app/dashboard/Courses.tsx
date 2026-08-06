"use client";

import { useEffect, useState } from "react";


type Course = {
    id: string;
    title: string;
    description: string;
    instructor: {
        name: string;
    };
};


export default function Courses() {


    const [courses, setCourses] = useState<Course[]>([]);


    useEffect(() => {

        fetch("/api/dashboard/courses")
            .then(res => res.json())
            .then(data => {
                setCourses(data.courses);
            });


    }, []);



    return (

        <div className="mt-10">

            <h2 className="text-2xl font-bold">
                Мои курсы
            </h2>


            <div className="grid gap-5 mt-5">

                {courses.map(course => (

                    <div
                        key={course.id}
                        className="border rounded-xl p-5"
                    >

                        <h3 className="text-xl font-semibold">
                            {course.title}
                        </h3>


                        <p>
                            {course.description}
                        </p>


                        <p className="mt-2">
                            Автор: {course.instructor.name}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    );
}