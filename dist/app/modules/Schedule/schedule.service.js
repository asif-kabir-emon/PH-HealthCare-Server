"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleServices = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const paginationHelper_1 = require("../../helpers/paginationHelper");
const createScheduleIntoDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate, startTime, endTime } = data;
    const intervalTime = 30; // 30 minutes interval
    const schedules = [];
    const currentDate = new Date(startDate); // start date
    const lastDate = new Date(endDate); // end date
    while (currentDate <= lastDate) {
        const startDateTime = new Date((0, date_fns_1.addMinutes)((0, date_fns_1.addHours)(`${(0, date_fns_1.format)(currentDate, "yyyy-MM-dd")}`, Number(startTime.split(":")[0])), Number(startTime.split(":")[1])));
        const endDateTime = new Date((0, date_fns_1.addMinutes)((0, date_fns_1.addHours)(`${(0, date_fns_1.format)(currentDate, "yyyy-MM-dd")}`, Number(endTime.split(":")[0])), Number(endTime.split(":")[1])));
        while (startDateTime < endDateTime) {
            const scheduleData = {
                startDateTime: startDateTime,
                endDateTime: (0, date_fns_1.addMinutes)(startDateTime, intervalTime),
            };
            const existingSchedule = yield prisma_1.default.schedule.findFirst({
                where: scheduleData,
            });
            if (!existingSchedule) {
                const result = yield prisma_1.default.schedule.create({
                    data: scheduleData,
                });
                schedules.push(result);
            }
            startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedules;
});
const getAllSchedulesFromDB = (user, params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDateTime, endDateTime } = params, filterData = __rest(params, ["startDateTime", "endDateTime"]);
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (Object.keys(filterData).length) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    if (startDateTime && endDateTime) {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: new Date(startDateTime),
                    },
                },
                {
                    startDateTime: {
                        lte: new Date(endDateTime),
                    },
                },
            ],
        });
    }
    const doctorSchedules = yield prisma_1.default.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user === null || user === void 0 ? void 0 : user.email,
            },
        },
    });
    const doctorScheduleIds = doctorSchedules.map((schedule) => schedule.scheduleId);
    andConditions.push({
        id: {
            notIn: doctorScheduleIds,
        },
    });
    const whereConditions = { AND: andConditions };
    const result = yield prisma_1.default.schedule.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });
    const total = yield prisma_1.default.schedule.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getScheduleByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.schedule.findUniqueOrThrow({
        where: {
            id,
        },
    });
    return result;
});
const deleteScheduleByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.schedule.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.ScheduleServices = {
    createScheduleIntoDB,
    getAllSchedulesFromDB,
    getScheduleByIdFromDB,
    deleteScheduleByIdFromDB,
};
