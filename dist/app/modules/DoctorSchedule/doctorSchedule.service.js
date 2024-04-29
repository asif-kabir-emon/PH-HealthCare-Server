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
exports.DoctorScheduleServices = void 0;
const prisma_1 = __importDefault(require("../../helpers/prisma"));
const paginationHelper_1 = require("../../helpers/paginationHelper");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const createDoctorScheduleIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => {
        return {
            doctorId: doctorData.id,
            scheduleId,
        };
    });
    const result = yield prisma_1.default.doctorSchedules.createMany({
        data: doctorScheduleData,
    });
    return result;
});
const getMySchedulesFromDB = (user, params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDateTime, endDateTime } = params, filterData = __rest(params, ["startDateTime", "endDateTime"]);
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    if (Object.keys(filterData).length) {
        if (typeof filterData.isBooked === "string" &&
            filterData.isBooked === "true") {
            filterData.isBooked = true;
        }
        else if (typeof filterData.isBooked === "string" &&
            filterData.isBooked === "false") {
            filterData.isBooked = false;
        }
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
                    schedule: {
                        startDateTime: {
                            gte: new Date(startDateTime),
                        },
                    },
                },
                {
                    schedule: {
                        startDateTime: {
                            lte: new Date(endDateTime),
                        },
                    },
                },
            ],
        });
    }
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    andConditions.push({
        doctorId: {
            equals: doctorData.id,
        },
    });
    const whereConditions = {
        AND: andConditions,
    };
    const result = yield prisma_1.default.doctorSchedules.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: (options === null || options === void 0 ? void 0 : options.sortsBy) && (options === null || options === void 0 ? void 0 : options.sortOrder)
            ? {
                [options.sortsBy]: options.sortOrder,
            }
            : {},
    });
    const total = yield prisma_1.default.doctorSchedules.count({
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
const deleteDoctorScheduleFromDB = (user, scheduleId) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorData = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const isBookedSchedule = yield prisma_1.default.doctorSchedules.findFirst({
        where: {
            doctorId: doctorData.id,
            scheduleId,
            isBooked: true,
        },
    });
    if (isBookedSchedule) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You can't delete a booked schedule");
    }
    const result = yield prisma_1.default.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId,
            },
        },
    });
    return result;
});
exports.DoctorScheduleServices = {
    createDoctorScheduleIntoDB,
    getMySchedulesFromDB,
    deleteDoctorScheduleFromDB,
};
