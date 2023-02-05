const moment = require('moment');
const slugify = require('slugify');
const isoDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

class Utils {
  static consoleLog(...args) {
    require('log-timestamp')(function () {
      return `[${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo', timeZoneName: 'short' })}]`;
    });
    console.log(...args);
  }

  static inDevelopment() {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' || env === 'local';
  }

  static inLocal() {
    const env = process.env.NODE_ENV || 'development';
    return env === 'local';
  }

  static isObject(obj) {
    return obj != null && obj.constructor.name === 'Object';
  }

  static parseBoolean(value) {
    return /true/i.test(value);
  }

  static parseInt(value) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  static slugify(str) {
    return slugify(str, {
      remove: /[$*_+~.()'"!\-:@]+/g
    });
  }

  static slugifyItems(items = [], strKey = 'name', slugKey = 'slug') {
    return items.map((item) => ({ ...item, [slugKey]: slugify(item[strKey]) }));
  }

  static removeAllWhiteSpacesButOne(str = '') {
    return str.replace(/\s+/g, ' ').trim();
  }

  static getCurrentDate() {
    return moment().toDate();
  }

  static isAfter(d1, d2) {
    return moment(d1).isAfter(d2);
  }

  static setDateTime(date, { hour = 0, minute = 0, second = 0 } = {}) {
    return moment(date).set({ hour, minute, second });
  }

  static addIntervalToDate(interval, date) {
    if (!interval) throw new Error('invalid interval');
    if (!moment(date).isValid()) throw new Error('invalid date');

    return moment(date).add(interval.amount, interval.key).toDate();
  }

  static subtractIntervalToDate(interval, date) {
    if (!interval) throw new Error('invalid interval');
    if (!moment(date).isValid()) throw new Error('invalid date');

    return moment(date).subtract(interval.amount, interval.key).toDate();
  }

  static getTimeAsUnits(time, { format = 'hh:mm A' } = {}) {
    const formattedTime = moment(time, format);
    return {
      hours: formattedTime.hours(),
      minutes: formattedTime.minutes(),
      seconds: formattedTime.seconds()
    };
  }

  static isDatePassed(date) {
    if (!moment(date).isValid()) throw new Error('invalid date');

    return moment(date).isBefore(moment());
  }

  static isFromDateSameOrBeforeToDate(from, to) {
    return moment(from).isSameOrBefore(moment(to));
  }

  static isFromDateSameOrAfterToDate(from, to) {
    return moment(from).isSameOrAfter(moment(to));
  }

  static isBetween(date, from, to) {
    const mDate = moment(date);
    const mFrom = moment(from);
    const mTo = moment(to);
    return mDate.isSameOrAfter(mFrom) && mDate.isSameOrBefore(mTo);
  }

  static format(date, format) {
    return moment(date).format(format);
  }

  static getIsoDayString(date) {
    if (!moment(date).isValid()) throw new Error('invalid date');

    const dayName = isoDays[moment(date).isoWeekday() - 1];

    return dayName;
  }

  /**
   * Merge destination object in src object, and ignore null props
   * @param src
   * @param dest
   * @returns {*}
   */
  static merge(src, dest) {
    if (!this.isObject(src) || !this.isObject(dest)) {
      return src;
    }

    const nSrc = src;
    Object.keys(dest).forEach((k) => {
      const ownProperty = Object.prototype.hasOwnProperty.call(dest, k);
      if (!ownProperty) {
        return;
      }

      if (dest[k] != null) {
        nSrc[k] = dest[k];
      }
    });

    return nSrc;
  }

  static testRegex(regex, value) {
    return value != null && value !== '' && regex.test(String(value));
  }

  static isValidObjectId(id) {
    return Utils.testRegex(/^[a-fA-F0-9]{24}$/, id);
  }

  static isObjectEmpty(obj) {
    const ObjectValues = Object.values(obj || {});
    return ObjectValues.length === 0 || !ObjectValues.every((value) => value !== '' && value != null);
  }

  static escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
  }

  static convertArabicNumbersToEnglish(str = '') {
    return str.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  }
}

module.exports = Utils;
