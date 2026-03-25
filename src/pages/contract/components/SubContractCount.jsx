import { subListContract } from "@/services/contract";
import { useRequest } from "@umijs/max";

const SubContractCount = ({ contract_id }) => {
  const { data: res } = useRequest(
    () => subListContract({ own_contract_id: contract_id }),
    { refreshDeps: [contract_id] }
  );

  return <span>({res?.length || 0})</span>;
};

export default SubContractCount;
