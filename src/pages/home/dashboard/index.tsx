import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router';



export default function DashboardPage() {




    return (
        <div>
            Dashboard Page
        </div>
    );
}


/** GUIDELINE TO DEVELOP DASHBOARD PAGE
 * 
 * 1. Total number of candidates -> students have been uploaded in "Students" Tab.
 * 
 * 
 * 2. Number of accepted participants
 * 
 * 3. Number of countries represented by the students
 *      A country list contains
 *       - Country Name
 *       - Number of students from that country
 * 
 * 4. Number of groups successfully formed
 * 
 * 
 * NOT PRIORITY FEATURES
 * 5. Breakdown/Statistic about
 *  - Age Groups
 *  - Gender
 *  - Race/Ethic Background
 * 
 * 
 * COHORT SPECIFIC INFORMATION (a group of students)
 * A group of students can be selected and contains the following information:
 *  - Number of countries represented + country name
 *  - Number of students who are "anchor" members.
 *  - Number of students waiting to be matched. 
 * 
 * 
 * 
 * 
*/
