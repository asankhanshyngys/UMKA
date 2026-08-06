"use client";

interface CoursesProps {
    courses: {
        id: string;
        title: string;
        price: number;
        status: string;
    }[];
}

export default function Courses({ courses }: CoursesProps) {
    return (
        <div>
            {/* отображение таблицы */}
        </div>
    );
}