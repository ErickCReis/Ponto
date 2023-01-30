import { useEffect, useState } from "react";

export const useConfirmClick = ({
  text,
  confirmText = "Confirmar",
  onConfirm,
}: {
  text: string;
  confirmText?: string;
  onConfirm: () => void;
}) => {
  const [isConfirm, setIsConfirm] = useState(false);
  const [textToShow, setTextToShow] = useState(text);

  useEffect(() => {
    if (!isConfirm) {
      return;
    }
    const timeout = setTimeout(() => {
      setIsConfirm(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isConfirm]);

  useEffect(() => {
    if (!isConfirm) {
      setTextToShow(text);
      return;
    }
    setTextToShow(confirmText);
  }, [isConfirm, text, confirmText]);

  const handleClick = () => {
    if (isConfirm) {
      onConfirm();
    } else {
      setIsConfirm(true);
    }
  };

  return {
    isConfirm,
    handleClick,
    textToShow,
  };
};
