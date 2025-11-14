import { useEffect, useState } from "react";
import { dashboardService } from "../../api/dashboardService";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>({});
  const [studentStats, setStudentStats] = useState<any>({});

  useEffect(() => {
    fetchDashboardData();
    fetchStudentStats();
  }, []);

  function fetchDashboardData() {
    dashboardService.getData().then((data) => {
      console.log("Cohort: ", data);

      setDashboardData(data);
    });
  }

  function fetchStudentStats() {
    dashboardService.getStudentStats().then((stats) => {
      console.log("Student Stats: ", stats);
      setStudentStats(stats);
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
        <h4>Cohort Name: </h4>

        <div>
          <h3>Number of countries represented in this cohort</h3>
          <span>0</span>
        </div>

        <div>
          <h3>Number of anchor candidates</h3>
          <span>0</span>
        </div>

        <div>
          <h3>Number of candidates waiting to be matched</h3>
          <span>0</span>
        </div>
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
