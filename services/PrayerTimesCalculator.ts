import Coordinates from "./Coordinates";
import CalculationMethod from "./CalculationMethod";
import AstronomicalCalculations from "./AstronomicalCalculations";
import Juristic from "./Juristic";

class PrayerTimesCalculator {
  date: Date;
  coordinates: Coordinates;
  calculationMethod: CalculationMethod;
  timeZone: number;
  juristic: Juristic;

  constructor(
    date: Date,
    coordinates: Coordinates,
    timeZone: number,
    calculationMethod: CalculationMethod,
    juristic: Juristic
  ) {
    this.date = date;
    this.coordinates = coordinates;
    this.calculationMethod = calculationMethod;
    this.timeZone = timeZone;
    this.juristic = juristic;
  }

  getPrayerTimes() {
    const calculation = new AstronomicalCalculations(
      this.date,
      this.coordinates,
      this.timeZone,
      this.calculationMethod,
      this.juristic
    );
    return calculation.getPrayerTimes();
  }
}

export default PrayerTimesCalculator;
