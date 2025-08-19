import { TimeWindow } from "./api/types";

export type TimeSlot = Partial<TimeWindow> & {
  label: string;
  day_in_week: string;
  start_t: string;
  end_t: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { label: "Friday morning (7am-12pm)", day_in_week: "Friday", start_t: "07:00:00", end_t: "12:00:00" },
  { label: "Friday afternoon (12pm-5pm)", day_in_week: "Friday", start_t: "12:00:00", end_t: "17:00:00" },
  { label: "Friday evening (5pm-10pm)", day_in_week: "Friday", start_t: "17:00:00", end_t: "22:00:00" },
  { label: "Saturday morning (7am-12pm)", day_in_week: "Saturday", start_t: "07:00:00", end_t: "12:00:00" },
  { label: "Saturday afternoon (12pm-5pm)", day_in_week: "Saturday", start_t: "12:00:00", end_t: "17:00:00" },
  { label: "Saturday evening (5pm-10pm)", day_in_week: "Saturday", start_t: "17:00:00", end_t: "22:00:00" },
  { label: "Sunday morning (7am-12pm)", day_in_week: "Sunday", start_t: "07:00:00", end_t: "12:00:00" },
  { label: "Sunday afternoon (12pm-5pm)", day_in_week: "Sunday", start_t: "12:00:00", end_t: "17:00:00" },
  { label: "Sunday evening (5pm-10pm)", day_in_week: "Sunday", start_t: "17:00:00", end_t: "22:00:00" },
]

const GENDER_OPTION = ['Female', 'Male', 'Other']


export { GENDER_OPTION, TIME_SLOTS };
