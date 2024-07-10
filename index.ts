import PrayerTimesCalculator from "./services/PrayerTimesCalculator";
import Coordinates from "./services/Coordinates";
import CalculationMethod from "./services/CalculationMethod";
import Juristic from "./services/Juristic";

const date = new Date("2024-07-10" + "T12:00:00Z");
const coordinates = new Coordinates(34.194775, 73.2404018);
const calculationMethod = CalculationMethod.KarachiMethod();
const prayerTimesCalculator = new PrayerTimesCalculator(
  date,
  coordinates,
  5,
  calculationMethod,
  Juristic.HANAFI
);
console.log(prayerTimesCalculator.getPrayerTimes());
