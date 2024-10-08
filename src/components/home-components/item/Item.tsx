import "../../../assets/styles";
import { useSelector, useDispatch } from "react-redux";
import { useState, useLayoutEffect, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import useModal from "../../../utils/useModal.ts";
import { RootState } from "../../../store/index.ts";
import InputFieldDisabled from "../../input-field/InputFieldDisabled.tsx";
import Menu from "./MenuPopup.tsx";
import SharePopup from "./share/SharePopup.tsx";
import AccountType, { ShareItemType } from "../../../types/item.ts";
import getDecryptedCreds, {
  DecryptedCreds,
} from "../../../utils/decrypt-creds.ts";
import EditItem from "./edit/EditItem.tsx";
import DeletePopup from "./delete/DeletePopup.tsx";
import CreateItem from "./create/CreateItem.tsx";
import EmptyItem from "./EmptyItem.tsx";
import { itemActions } from "../../../store/item.slice.ts";

const Item = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isReveal, setIsReveal] = useState(false);
  const [isEditing, setIsEditting] = useState(false);
  // const [isCreating, setIsCreating] = useState(false);
  const [emptyItem, setEmptyItem] = useState(false);
  const [decCreds, setDecCreds] = useState<DecryptedCreds>();
  const isCreating = useSelector((state: RootState) => state.item.isCreating);
  const selectedItem = useSelector(
    (state: RootState) => state.item.selectedItem
  );
  const enn_pri = useSelector((state: RootState) => state.login.enc_pri);
  const sharedItem = isShareItemType(selectedItem);

  const { data, isSuccess, isError } = useQuery({
    queryKey: ["item", selectedItem.id],
    queryFn: async () => {
      const decryptCreds = await getDecryptedCreds(
        selectedItem.enc_credentials,
        selectedItem.type,
        ...(sharedItem ? [enn_pri] : [])
      );
      return decryptCreds;
    },
    enabled: !!selectedItem.id && !isCreating,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (isSuccess) setDecCreds(data);
  }, [data, isSuccess]);

  if (isError) console.log("Failed to decrypt");

  useLayoutEffect(() => {
    setTimeout(() => {
      const cachedItems =
        queryClient.getQueryData<AccountType[]>(["items"]) || [];
      setEmptyItem(cachedItems.length === 0);
    }, 100);

    //reset
    setIsEditting(false);
    closeModalDelete();
    closeModalShare();

    // if (!isCreating) {
    //   const fetchData = async () => {
    //     try {
    //       const decryptCreds = await getDecryptedCreds(
    //         selectedItem.enc_credentials,
    //         selectedItem.type
    //       );
    //       // const decryptCreds = {
    //       //   credential: selectedItem.enc_credentials,
    //       //   password: "hihi",
    //       //   raw_creds: selectedItem.enc_credentials,
    //       // };
    //       setDecCreds(decryptCreds);
    //     } catch (error) {
    //       console.error("Error fetching decrypted credentials:", error);
    //     }
    //   };

    //   fetchData();
    // }
  }, [selectedItem, isCreating]);

  const { modalRef, buttonRef, isOpen, closeModal, openModal } = useModal();
  const {
    modalRef: modalRefShare,
    isOpen: isOpenShare,
    closeModal: closeModalShare,
    openModal: openModalShare,
  } = useModal();

  const {
    modalRef: modalRefDelete,
    isOpen: isOpenDelete,
    closeModal: closeModalDelete,
    openModal: openModalDelete,
  } = useModal();

  const handleReveal = () => {
    setIsReveal(!isReveal);
  };

  const setOption = (option: string) => {
    if (option === "edit") {
      setIsEditting(true);
    }
    if (option === "delete") openModalDelete();
    if (option === "share") openModalShare();
    if (option === "create") {
      dispatch(itemActions.setISCreatingTrue());
    }
    closeModal();
  };

  useLayoutEffect(() => {
    setIsReveal(false);
  }, [selectedItem]);

  return (
    <div className="item-section flex flex-col flex-grow items-center">
      {!emptyItem && !isEditing && !isCreating && (
        <>
          {isOpenShare && (
            <div className="blur-bg">
              <div
                className="absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4"
                ref={modalRefShare}
              >
                <SharePopup closeModal={closeModalShare} />
              </div>
            </div>
          )}
          {isOpenDelete && (
            <div className="blur-bg">
              <div
                className="absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4"
                ref={modalRefDelete}
              >
                <DeletePopup closeModal={closeModalDelete} />
              </div>
            </div>
          )}
          <div className="header w-full h-[90px] bg-white flex items-center justify-between p-[20px] card-border">
            <div className="h-full flex items-center gap-[20px] ">
              <div className="w-[48px] h-[48px] flex justify-center">
                <img
                  src={`${
                    selectedItem.logo_url
                      ? selectedItem.logo_url
                      : "/images/DefaultLogo.png"
                  }`}
                  alt="DefaultLogo"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-black text-2xl not-italic font-semibold leading-[normal]">
                  {selectedItem.name}
                </p>
                <div className="flex gap-[2px]">
                  <p className="text-black text-sm not-italic font-normal leading-[normal]">
                    {selectedItem.order
                      ? "account " + selectedItem.order
                      : null}
                  </p>
                  <p className="text-[#767C7C] text-sm not-italic font-normal leading-[normal]">
                    {sharedItem
                      ? "| Item shared by " + selectedItem.shared_by.email
                      : null}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="w-[32px] h-[32px] flex justify-center items-center"
              onClick={isOpen ? closeModal : openModal}
              ref={buttonRef}
            >
              <img src="/images/More.png" alt="More" className="" />
            </div>
          </div>
          <div className="body flex flex-col items-center overflow-auto">
            {isOpen && (
              <div className="absolute right-0" ref={modalRef}>
                <Menu setOption={setOption} />
              </div>
            )}
            <div className="info-section w-fit flex flex-col items-center my-[4px]">
              <div className="w-full pl-[120px] py-[8px] border-solid border-b-[1px] border-[#D9D9D9] flex justify-between items-center">
                <p className="body-text-bold">Account</p>
                <button
                  className="text-[#29428D] text-xs not-italic font-medium leading-[normal] rounded-[4px] py-[4px] px-[8px] border-solid border-[2px] border-[#29428D]"
                  onClick={handleReveal}
                >
                  {!isReveal ? "Reveal" : "Hide"}
                </button>
              </div>
              <div className="flex flex-col gap-[4px] my-[4px]">
                <InputFieldDisabled
                  title="Credentials"
                  value={isReveal ? decCreds?.credential ?? "" : "*****"}
                  src="/images/Copy.png"
                  alt="Copy"
                  actualValue={decCreds?.credential ?? ""}
                />
                <InputFieldDisabled
                  title="Password"
                  value={isReveal ? decCreds?.password ?? "" : "*****"}
                  src="/images/Copy.png"
                  alt="Copy"
                  actualValue={decCreds?.password ?? ""}
                />
              </div>
            </div>
            <div className="info-section w-fit flex flex-col items-center my-[4px]">
              <div className="w-full pl-[120px] py-[8px] border-solid border-b-[1px] border-[#D9D9D9]">
                <p className="body-text-bold">Website</p>
              </div>
              <div className="flex flex-col gap-[4px] my-[4px]">
                <InputFieldDisabled
                  title=""
                  value={selectedItem.site}
                  src="/images/Link.png"
                  alt="Link"
                />
              </div>
            </div>
            <div className="info-section w-fit flex flex-col items-center my-[4px]">
              <div className="w-full pl-[120px] py-[8px] border-solid border-b-[1px] border-[#D9D9D9]">
                <p className="body-text-bold">Modification</p>
              </div>
              <div className="flex flex-col gap-[4px] my-[4px]">
                <InputFieldDisabled
                  title="Created"
                  value={selectedItem.added_at}
                />
                <InputFieldDisabled
                  title="Modified"
                  value={selectedItem.updated_at}
                />
              </div>
            </div>
          </div>
        </>
      )}
      {!emptyItem && isEditing && (
        <EditItem cancel={() => setIsEditting(false)} />
      )}
      {isCreating && (
        <CreateItem cancel={() => dispatch(itemActions.setISCreatingFalse())} />
      )}
      {emptyItem && !isEditing && !isCreating && <EmptyItem />}
    </div>
  );
};

function isShareItemType(item: AccountType): item is ShareItemType {
  return (item as ShareItemType).shared_by !== undefined;
}

export default Item;
