"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface iAppProps{
  text:string
}

export function SubmitButton({text}:iAppProps) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled className=" w-full">
          <Loader2 className=" size-4 mr-2 animate-spin" /> Please wait...
        </Button>
      ) : (
        <Button type="submit" className=" w-full">
          {text}
        </Button>
      )}
    </>
  );
}
