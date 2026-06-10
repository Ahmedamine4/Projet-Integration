import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import api from "@/services/api";

export const useInstitutionStore = defineStore('institution', () => {
	const institutions = ref([]);
	const certificationInstitutions = ref([]);
	const selectedSchoolPath = reactive({
		bachelorSchool: '',
		masterSchool: '',
		phdInstitution: '',
	});

	const selectedInstitutions = computed(() => {
		return institutions.value.filter((institution) => {
			return Object.values(selectedSchoolPath).includes(institution.institution_id);
		});
	});

	function extractInstitutions(responseData) {
		if (Array.isArray(responseData)) return responseData;
		if (Array.isArray(responseData?.data)) return responseData.data;
		return [];
	}

	async function fetchInstitutions() {
		const response = await api.get('/getInstitutions/academiques');

		institutions.value = extractInstitutions(response.data);

		return institutions.value;
	}

	async function fetchCertificationInstitutions() {
		const response = await api.get('/getInstitutions/autres');

		certificationInstitutions.value = extractInstitutions(response.data);

		return certificationInstitutions.value;
	}

	function setSchoolPath(schoolPath) {
		Object.keys(selectedSchoolPath).forEach(key => {
			selectedSchoolPath[key] = schoolPath[key]?.institutionId || '';
		});
	}

	return {
		institutions,
		certificationInstitutions,
		selectedSchoolPath,
		selectedInstitutions,
		fetchInstitutions,
		fetchCertificationInstitutions,
		setSchoolPath,
	}
});
