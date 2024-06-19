export type TSchedule = {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
};

export type TScheduleFilters = {
    startDateTime?: string;
    endDateTime?: string;
    doctorId?: string;
};
