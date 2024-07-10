class CalculationMethod {
    fajrDegree: number;
    ishaDegree: number;
    private constructor(fajrDegree: number, ishaDegree: number) {
        this.fajrDegree = fajrDegree;
        this.ishaDegree = ishaDegree;
    }

    static KarachiMethod(): CalculationMethod {
        return new CalculationMethod(18, 18);
    }
}

export default CalculationMethod