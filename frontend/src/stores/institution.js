import { defineStore } from "pinia";
import { ref, computed } from "vue"; 
import { schools as fallbackSchools } from "@/data/schools";  
import api from "@/services/api";

export const useInstitutionStore = defineStore('institution', () => {
	const institutions = ref([]);
	const selectedSchoolPath = ref({
		bachelorSchool: '',
		masterSchool: '',
		phdInstitution: '',
	});

	const selectedInstitutions = computed(() => {
		return Object.values(selectedSchoolPath.value).filter(Boolean);
	});

	async function fetchInstitutions() {
		const response = await api.get('/getInstitutions');

  	institutions.value = response.data?.length > 0
    ? response.data.map((school) => school.nom)
    : fallbackSchools;

		return institutions.value;
	}

	function setSchoolPath(schoolPath) {
		selectedSchoolPath.value = schoolPath;
	}

	return {
		institutions,
		selectedSchoolPath,
		selectedInstitutions,
		fetchInstitutions,
		setSchoolPath,
	}
});