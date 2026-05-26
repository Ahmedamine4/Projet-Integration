import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import api from "@/services/api";

export const useInstitutionStore = defineStore('institution', () => {
	const institutions = ref([]);
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

	async function fetchInstitutions() {
		const response = await api.get('/getInstitutions');

  	institutions.value = response.data?.length > 0
    ? response.data
    : [];

		return institutions.value;
	}

	function setSchoolPath(schoolPath) {
		Object.keys(selectedSchoolPath).forEach(key => {
			selectedSchoolPath[key] = schoolPath[key]?.institutionId || '';
		});
	}

	return {
		institutions,
		selectedSchoolPath,
		selectedInstitutions,
		fetchInstitutions,
		setSchoolPath,
	}
});
