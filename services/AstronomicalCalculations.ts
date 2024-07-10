const { sin, cos, atan2, asin, acos, PI, sqrt, atan, tan } = Math;
import Coordinates from "./Coordinates";
import CalculationMethod from "./CalculationMethod";
import Juristic from "./Juristic";


class AstronomicalCalculations {
  private date: Date;
  private coordinates: Coordinates;
  private timeZone: number;
  private calculationMethod: CalculationMethod;
  private juristic: Juristic;

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

  private getYearMonthHour(newDate: Date) {
    //const newDate = new Date(date + 'T12:00:00Z');
    const Year = newDate.getUTCFullYear();
    const Month = newDate.getUTCMonth() + 1;
    const Day = newDate.getUTCDate();
    const Hour = newDate.getUTCHours();
    const Minute = newDate.getUTCMinutes();
    const Second = newDate.getUTCSeconds();
    return { Year, Month, Hour, Second, Day, Minute };
  }

  private arccot(x: number) {
    return PI / 2 - atan(x);
  }

  private radians(degrees: number) {
    return degrees * (PI / 180);
  }

  private degrees(radians: number) {
    return radians * (180 / PI);
  }

  private DY2k(Year: number, Month: number, Day: number, Hour: number, Zone: number) {
    if (Month <= 2) {
      Year -= 1;
      Month += 12;
    }
    const AAAA = Math.floor(Year / 100);
    const BBBB = 2 - AAAA + Math.floor(AAAA / 4);
    const CCCC = Math.floor(365.25 * Year);
    const DDDD = Math.floor(30.6001 * (Month + 1));
    const JD = BBBB + CCCC + DDDD + Day + (Hour - Zone) / 24.0 - 730550.5;
    return JD;
  }

  private EoT(Year: number, Month: number, Day: number, Hour: number, Minute: number, Second: number, Zone: number, DST: false) {
    const Days_since_Epoch = this.DY2k(Year, Month, Day, Hour, Zone);
    const Mean_Long_Sun_d = (280.46 + 0.9856474 * Days_since_Epoch) % 360.0;
    const Mean_Anomaly_d = (357.528 + 0.9856003 * Days_since_Epoch) % 360.0;
    const Mean_Anomaly_r = this.radians(Mean_Anomaly_d);
    const Ecliptic_Long_d = Mean_Long_Sun_d + 1.915 * sin(Mean_Anomaly_r) + 0.020 * sin(2 * Mean_Anomaly_r);
    const Ecliptic_Long_r = this.radians(Ecliptic_Long_d);
    const Obliquity_d = 23.439 - 0.0000004 * Days_since_Epoch;
    const Obliquity_r = this.radians(Obliquity_d);
    const Right_Ascension_r = atan2(cos(Obliquity_r) * sin(Ecliptic_Long_r), cos(Ecliptic_Long_r));
    const Right_Ascension_d = (this.degrees(Right_Ascension_r)) % 360.0;
    const Declination_r = asin(sin(Obliquity_r) * sin(Ecliptic_Long_r));
    const Declination_d = this.degrees(Declination_r);
    let EoT_d = Mean_Long_Sun_d - Right_Ascension_d;
    if (EoT_d > 50) {
      EoT_d -= 360;
    }
    const EoT_m = -EoT_d * 4;  
    return { EoT_m, Declination_d };
  }

  private calculateTimeDifference(altitude: number, latitude: number, declination: number) {
    const altitude_r = this.radians(altitude);
    const latitude_r = this.radians(latitude);
    const declination_r = this.radians(declination);
  
    const cosH = (sin(altitude_r) - sin(latitude_r) * sin(declination_r)) / (cos(latitude_r) * cos(declination_r));
    const H = this.degrees(acos(cosH));
  
    return H / 15; // Convert degrees to hours
  }

  private calculateDhuhr() {
    const dateData = this.getYearMonthHour(this.date);
  
    const { EoT_m, Declination_d } = this.EoT(dateData.Year, dateData.Month, dateData.Day, dateData.Hour, dateData.Minute, dateData.Second, this.timeZone, false);
  
  
    const EoT_h = EoT_m / 60;
  
    const dhuhrTime = 12 + EoT_h + (this.timeZone - this.coordinates.getLng() / 15);
  

    const dhuhrHours = Math.floor(dhuhrTime);
    const dhuhrMinutes = Math.floor((dhuhrTime - dhuhrHours) * 60);
  
    return { dhuhrTime, dhuhrHours, dhuhrMinutes, Declination_d };
  }

  private calculateMaghrib(elevation = 0) {
    const { dhuhrTime, Declination_d } = this.calculateDhuhr();
  

    const altitude: number = -0.833 + 0.0347 * sqrt(elevation);
  

    const timeDiff = this.calculateTimeDifference(altitude, this.coordinates.getLat(), Declination_d);
  

    const maghribTimeUTC = dhuhrTime + timeDiff;
  

    const maghribHours = Math.floor(maghribTimeUTC);
    const maghribMinutes = Math.floor((maghribTimeUTC - maghribHours) * 60);
  
    return { maghribHours, maghribMinutes };
  }

  private calculateFajr(elevation = 0) {
    const { dhuhrTime, Declination_d } = this.calculateDhuhr();
  
 
    const fajrAngle = -(this.calculationMethod.fajrDegree) + 0.0347 * sqrt(elevation);
  

    const timeDiff = this.calculateTimeDifference(fajrAngle, this.coordinates.getLat(), Declination_d);
  

    const fajrTimeUTC = dhuhrTime - timeDiff;
  

    const fajrHours = Math.floor(fajrTimeUTC);
    const fajrMinutes = Math.floor((fajrTimeUTC - fajrHours) * 60);
  
    return { fajrHours, fajrMinutes };
  }

  private calculateIsha(elevation = 0) {
    const { dhuhrTime, Declination_d } = this.calculateDhuhr();
  

    const ishaAngle = -15 + 0.0347 * sqrt(elevation);
  

    const timeDiff = this.calculateTimeDifference(ishaAngle, this.coordinates.getLat(), Declination_d);
  

    const ishaTimeUTC = dhuhrTime + timeDiff;
  

    const ishaHours = Math.floor(ishaTimeUTC);
    const ishaMinutes = Math.floor((ishaTimeUTC - ishaHours) * 60);
  
    return { ishaHours, ishaMinutes };
  }

  private calculateAsr() {
    const { dhuhrTime, Declination_d } = this.calculateDhuhr();
  
    const latitude_r = this.radians(this.coordinates.getLat());
    const declination_r = this.radians(Declination_d);
  
    const A_n = this.degrees(this.arccot(this.juristic + Math.abs(tan(latitude_r - declination_r))));
  
    const timeDiff = this.calculateTimeDifference(A_n, this.coordinates.getLat(), Declination_d);
  
    const asrTimeUTC = dhuhrTime + timeDiff;
  
    const asrHours = Math.floor(asrTimeUTC);
    const asrMinutes = Math.floor((asrTimeUTC - asrHours) * 60);
  
    return { asrHours, asrMinutes };
  }
  

  private formatTime(hours: number, minutes: number) {
    const formattedHours = hours % 24; 
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = formattedHours % 12 || 12; 
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${adjustedHours}:${formattedMinutes} ${period}`;
  }

  getPrayerTimes() {
    const { fajrHours, fajrMinutes } = this.calculateFajr();
    const { maghribHours, maghribMinutes } = this.calculateMaghrib();
    const { ishaHours, ishaMinutes } = this.calculateIsha();
    const { asrHours, asrMinutes } = this.calculateAsr();
    const { dhuhrHours, dhuhrMinutes } = this.calculateDhuhr();
    return {
      fajr: this.formatTime(fajrHours, fajrMinutes),
      dhuhr: this.formatTime(dhuhrHours, dhuhrMinutes),
      asr: this.formatTime(asrHours, asrMinutes),
      maghrib: this.formatTime(maghribHours, maghribMinutes),
      isha: this.formatTime(ishaHours, ishaMinutes),
    };
  }
}

export default AstronomicalCalculations
