/**
 * A simple utility to convert Gregorian Date (AD) to Nepali Date (BS)
 * Note: This is a simplified version for common years.
 */

const AD_BS_DIFFERENCE = 56.7; // Approx years

export const getNepaliMonth = (index: number): { en: string; ne: string } => {
  const months = [
    { en: 'Baisakh', ne: 'बैशाख' },
    { en: 'Jestha', ne: 'जेठ' },
    { en: 'Ashad', ne: 'असार' },
    { en: 'Shrawan', ne: 'साउन' },
    { en: 'Bhadra', ne: 'भदौ' },
    { en: 'Ashwin', ne: 'असोज' },
    { en: 'Kartik', ne: 'कात्तिक' },
    { en: 'Mangsir', ne: 'मंसिर' },
    { en: 'Poush', ne: 'पुष' },
    { en: 'Magh', ne: 'माघ' },
    { en: 'Falgun', ne: 'फागुन' },
    { en: 'Chaitra', ne: 'चैत' },
  ];
  return months[index] || months[0];
};

export const getCurrentNepaliMonthYear = () => {
  const today = new Date();
  let bsYear = today.getFullYear() + 56;
  let bsMonth = today.getMonth() + 8; // Approx mapping
  
  if (bsMonth > 11) {
    bsMonth -= 12;
    bsYear += 1;
  }

  const monthInfo = getNepaliMonth(bsMonth);
  return {
    year: bsYear,
    month: bsMonth,
    monthNameEn: monthInfo.en,
    monthNameNe: monthInfo.ne,
    formatted: `${monthInfo.en} ${bsYear}`,
    formattedNe: `${monthInfo.ne} ${bsYear}`,
  };
};

/**
 * Returns an array of months for a picker
 */
export const getNepaliMonthsList = () => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const m = getNepaliMonth(i);
    months.push({ labelEn: m.en, labelNe: m.ne, index: i });
  }
  return months;
};

export const getNepaliYearsList = () => {
  const currentBS = getCurrentNepaliMonthYear().year;
  const years = [];
  for (let y = currentBS - 5; y <= currentBS + 5; y++) {
    years.push(y);
  }
  return years;
};

export const getLast6MonthsBS = () => {
  const { month, year } = getCurrentNepaliMonthYear();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    let m = month - i;
    let y = year;
    if (m < 0) {
      m += 12;
      y -= 1;
    }
    const monthInfo = getNepaliMonth(m);
    months.push({ 
      labelEn: monthInfo.en, 
      labelNe: monthInfo.ne, 
      year: y,
      month: m,
      formatted: `${monthInfo.en} ${y}`
    });
  }
  return months;
};
