import React from "react";

const Beams: React.FC = () => {
  return (
    <div
      className="absolute top-0 h-full w-full"
      style={{
        background:
          "radial-gradient(100% 100% at 0% 0%, var(--gray-gradient) 0%, var(--black-a12, rgb(0, 0, 0)) 100%)",
        mask: "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.224) 88.2883%, rgba(0, 0, 0, 0) 100%)",
        opacity: 1,
      }}
    >
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(var(--gray-gradient) 0%, var(--gray-gradient) 83.9344%, var(--accent-gradient) 100%)",
          mask: "linear-gradient(149deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20.0362%, rgba(0, 0, 0, 0) 36.175%, rgb(0, 0, 0) 55.4054%, rgba(0, 0, 0, 0.13) 67.1171%, rgb(0, 0, 0) 78.2306%, rgba(0, 0, 0, 0) 97.2973%)",
          opacity: 0.05,
          transform: "skewX(45deg)",
          width: "50%",
          height: "101%",
          left: "0",
          top: 0,
          position: "absolute",
        }}
      ></div>
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(var(--gray-gradient) 0%, var(--gray-gradient) 83.9344%, var(--accent-gradient) 100%)",
          mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 11.3985%, rgb(0, 0, 0) 25.5578%, rgba(0, 0, 0, 0.55) 41.6966%, rgba(0, 0, 0, 0.13) 67.1171%, rgb(0, 0, 0) 78.2306%, rgba(0, 0, 0, 0) 97.2973%)",
          opacity: 0.05,
          transform: "skewX(45deg)",
          width: "50%",
          height: "101%",
          left: "-200px",
          top: 0,
          position: "absolute",
        }}
      ></div>
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(var(--gray-gradient) 0%, var(--gray-gradient) 67%, var(--accent-gradient) 100%)",
          mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 9.81489%, rgb(0, 0, 0) 20.0362%, rgba(0, 0, 0, 0.55) 28.5878%, rgba(0, 0, 0, 0.424) 40.0901%, rgb(0, 0, 0) 48.6486%, rgba(0, 0, 0, 0.267) 54.5045%, rgba(0, 0, 0, 0.13) 78.579%, rgb(0, 0, 0) 88.554%, rgba(0, 0, 0, 0) 97.2973%)",
          opacity: 0.05,
          transform: "skewX(45deg)",
          width: "50%",
          height: "101%",
          left: "100px",
          top: 0,
          position: "absolute",
        }}
      ></div>
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(var(--gray-gradient) 0%, var(--gray-gradient) 83.9344%, var(--accent-gradient) 100%)",
          mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17.6591%, rgba(0, 0, 0, 0.55) 26.6417%, rgb(0, 0, 0) 35.2302%, rgba(0, 0, 0, 0) 47.6985%, rgba(0, 0, 0, 0.13) 69.1776%, rgb(0, 0, 0) 79.1456%, rgba(0, 0, 0, 0) 97.2973%)",
          opacity: 0.05,
          transform: "skewX(45deg)",
          width: "50%",
          height: "101%",
          left: "50px",
          top: 0,
          position: "absolute",
        }}
      ></div>
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(var(--gray-gradient) 0%, var(--gray-gradient) 83.9344%, var(--accent-gradient) 100%)",
          mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20.0362%, rgba(0, 0, 0, 0.55) 27.5778%, rgb(0, 0, 0) 42.3423%, rgba(0, 0, 0, 0) 48.6047%, rgba(0, 0, 0, 0.13) 67.1171%, rgb(0, 0, 0) 74.9525%, rgb(0, 0, 0) 82.4324%, rgba(0, 0, 0, 0.47) 88.6719%, rgba(0, 0, 0, 0) 97.2973%)",
          opacity: 0.05,
          transform: "skewX(45deg)",
          width: "50%",
          height: "101%",
          left: "200px",
          top: 0,
          position: "absolute",
        }}
      ></div>
    </div>
  );
};

export default Beams;
