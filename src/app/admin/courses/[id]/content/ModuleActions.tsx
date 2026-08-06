"use client";

import { deleteModule } from "./actions";


export default function ModuleActions({

                                          moduleId,
                                          courseId,

                                      }:{

    moduleId:string;
    courseId:string;

}){


    return (

        <button

            onClick={async()=>{

                await deleteModule(
                    moduleId,
                    courseId
                );

            }}

            className="text-red-600"

        >

            Delete

        </button>

    );

}