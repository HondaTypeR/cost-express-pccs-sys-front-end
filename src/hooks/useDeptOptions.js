import { fetchDeptOptions } from "@/services/dept";
import { useEffect, useState } from "react";

export const getDeptLabel = (allDeptOptions, id) => {
  const strId = String(id);
  return (
    allDeptOptions.find((d) => String(d.value) === strId)?.label || id
  );
};

export const getDepartmentSelectOptions = (
  deptList,
  allDeptOptions,
  companyDepartment,
  selectedDeptIds = []
) => {
  const companyIds = new Set(
    String(companyDepartment || "")
      .split(",")
      .filter(Boolean)
      .map(String)
  );
  const fromCompany = deptList.filter((dept) =>
    companyIds.has(String(dept.value))
  );
  const selectedIds = (
    Array.isArray(selectedDeptIds)
      ? selectedDeptIds
      : String(selectedDeptIds || "").split(",")
  )
    .filter(Boolean)
    .map(String);
  const existing = new Set(fromCompany.map((d) => String(d.value)));
  const extra = selectedIds
    .filter((id) => !existing.has(id))
    .map((id) => {
      const opt = allDeptOptions.find((d) => String(d.value) === id);
      return opt || { label: id, value: id };
    });
  return [...fromCompany, ...extra];
};

export function useDeptOptions() {
  const [deptList, setDeptList] = useState([]);
  const [allDeptOptions, setAllDeptOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeptOptions()
      .then(({ deptList: list, allDeptOptions: allOptions }) => {
        setDeptList(list);
        setAllDeptOptions(allOptions);
      })
      .finally(() => setLoading(false));
  }, []);

  return { deptList, allDeptOptions, loading };
}
