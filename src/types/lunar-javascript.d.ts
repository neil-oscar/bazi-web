declare module 'lunar-javascript' {
  export interface SolarInstance {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getLunar(): LunarInstance;
  }

  export interface LunarInstance {
    getSolar(): SolarInstance;
    getEightChar(): EightCharInstance;
    getYear(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getTimeZhi(): string;
    getYearShengXiao(): string;
  }

  export interface EightCharInstance {
    setSect(sect: number): void;
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getDayGan(): string;
    getYearHideGan(): string[] | string;
    getMonthHideGan(): string[] | string;
    getDayHideGan(): string[] | string;
    getTimeHideGan(): string[] | string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearDiShi(): string;
    getMonthDiShi(): string;
    getDayDiShi(): string;
    getTimeDiShi(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getYun(gender: number, sect: number): YunInstance;
  }

  export interface YunInstance {
    isForward(): boolean;
    getDaYun(count?: number): DaYunInstance[];
  }

  export interface DaYunInstance {
    getIndex(): number;
    getStartAge(): number;
    getEndAge(): number;
    getStartYear(): number;
    getEndYear(): number;
    getGanZhi(): string;
    getLiuNian(count?: number): LiuNianInstance[];
  }

  export interface LiuNianInstance {
    getAge(): number;
    getYear(): number;
    getGanZhi(): string;
  }

  export const Solar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): SolarInstance;
  };

  export const Lunar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): LunarInstance;
  };
}
