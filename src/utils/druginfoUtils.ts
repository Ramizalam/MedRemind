// utils/drugInfoUtils.ts
export const fetchDrugInfo = async (medicineName: string) => {
    try {
      const response = await fetch(
        `https://api.fda.gov/drug/label.json?search=indications_and_usage:${medicineName}&limit=1`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch drug information');
      }
      const data = await response.json();
      return data.results[0]; // Extract relevant info
    } catch (error) {
      console.error('Error fetching drug info:', error);
      return null;
    }
  };