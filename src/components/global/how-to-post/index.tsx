"use client";

import React from "react";
import parse from "html-react-parser";

type Props = {
  title: string;
  content: string;
};

const HowToPost = ({ title, content }: Props) => {
  return (
    <div className="flex flex-col gap-y-10 lg:col-span-2 mt-10">
      <h2 className="text-5xl font-bold">{title}</h2>
      <div className="prose prose-invert max-w-none">
        {parse(content)}
      </div>
    </div>
  );
};

export default HowToPost;
