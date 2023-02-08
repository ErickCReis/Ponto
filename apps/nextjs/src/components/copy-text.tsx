import { useState } from "react";

import { Button } from "~/components/button";

export const CopyText = ({ copyText }: { copyText: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  async function copyTextToClipboard(text: string) {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  }

  const handleCopyClick = () => {
    copyTextToClipboard(copyText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="flex">
      <input value={copyText} readOnly className="text-zinc-800 w-[400px]" />
      <Button onClick={handleCopyClick} className="rounded-l-none">
        <span>{isCopied ? "Copiado!" : "Copiar"}</span>
      </Button>
    </div>
  );
};
