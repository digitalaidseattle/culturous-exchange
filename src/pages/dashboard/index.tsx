import { useEffect, useState } from "react";
import { dashboardService } from "../../api/dashboardService";

export default function DashboardPage() {
  const [studentStats, setStudentStats] = useState<any>({});
  const [cohortStats, setCohortStats] = useState<any>({});

  useEffect(() => {
    fetchStudentStats();
    fetchCohortStats();
  }, []);

  function fetchStudentStats() {
    dashboardService.getStudentStats().then((stats) => {
      console.log("Student Stats: ", stats);
      setStudentStats(stats);
    });
  }

  function fetchCohortStats() {
    dashboardService.getCohortStats().then((stats) => {
      console.log("Cohort Stats: ", stats);
      setCohortStats(stats);
    });
  }

  return (
    <div>
      Dashboard Page
      <div>
        <h3>Total number of candidates:</h3>
        <span>{studentStats.students?.total ?? 0}</span>
      </div>
      <div>
        <h3>Total number of matched/accepted participants: </h3>
        <span>0</span>
      </div>
      <div>
        <h3>Total number of countries represented: </h3>
        <span>{studentStats.countries?.total ?? 0}</span>

        {
          Object.entries(studentStats.countries?.byCountries || {}).map(([country, count]) => (
            <li key={country}>
              {country}: {count}
            </li>
          ))
        }
      </div>
      <div>
        <h3>Total number of groups successfully formed: </h3>
        <span>0</span>
      </div>
      <div>
        <h3>Not Priority: Breakdown of Age Groups </h3>
        <ul>
          {
            Object.entries(studentStats.students?.byAges || {}).map(([ageGroup, count]) => (
              <li key={ageGroup}>
                Age {ageGroup}: {count} members
              </li>
            ))
          }
        </ul>
      </div>
      <div>
        <h3>Not Priority: Breakdown of Gender </h3>
        <ul>
          {
            Object.entries(studentStats.students?.byGenders || {}).map(([gender, count]) => (
              <li key={gender}> 
                Gender {gender}: {count} members
              </li>
            ))
          }
        </ul>
      </div>
      <div>
        <h3>Not Priority: Breakdown of race/ethnic background </h3>
        <span>0</span>
      </div>


      <div>
        <h2> A New/Current Cohort Detail:</h2>
        {
          Object.entries(cohortStats || {}).map(([index, cohort]) => (
            <div key={index}>
              <h3>Cohort Name: {cohort.cohortName}</h3>
              <h4>Cohort ID: {cohort.cohortId}</h4>
              <div>
                <h4>Number of countries represented:</h4>
                {
                  Object.entries(cohort.byCountries || {}).map(([country, count]) => (
                    <li key={country}>
                      {country}: {count}
                    </li>
                  ))
                }
              </div>
              <div>
                <h4>Number of candidates enrolled:</h4>
                <span>{cohort.numberOfEnrollments}</span>
              </div>
              <div>
                <h4>Number of anchor candidates:</h4>
                <span>{cohort.numberOfAnchorStudents}</span>
              </div>
              <div>
                <h4>Number of candidates waiting to be matched:</h4>
                <span>{cohort.numberOfPendingStudents}</span>
              </div>
            </div>
          ))  
        }
      </div>
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
