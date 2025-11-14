import React from "react";

// Example images (replace with your own URLs)
const boxData = [
  {
    img: "Media/Agent-1.png",
    title: "Team of Industry Experts",
    description:
      "We take pride in our team of experienced professionals who bring in-depth knowledge, dedication, and industry insight to every interaction. With a strong commitment to excellence and client satisfaction, our experts work closely with you to understand your unique needs and provide tailored solutions. Whether you're facing a challenge or planning ahead, you can count on our team to offer trusted guidance, timely support, and a seamless experience every step of the way.",
  },
  {
    img: "Media/Agent-2.png",
    title: "No Upfront Charges",
    description:
      "We believe in building trust through transparency and fairness. That’s why we do not require any upfront payments for our services. You only pay when real value is delivered, ensuring complete peace of mind and a risk-free experience from the very beginning.",
  },
  {
    img: "Media/Agent-3.png",
    title: "Customer-First Approach",
    description:
      "Our clients are at the heart of everything we do. We take the time to understand your individual needs and priorities, ensuring every solution we offer is tailored to your goals. Our team is committed to delivering prompt, honest, and personalized support—because your satisfaction and success are what matter most to us. With a focus on long-term relationships, we go beyond transactions to truly make a difference in your journey.",
  },
];

export default function InfoBoxes() {
  return (
    <div className="min-h-screen  py-12 px-4">
      <h2 className="justify-center align-bottom text-center text-gray-800 font-semibold text-2xl mb-3">Why Madadghaar?</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {boxData.map((box, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border-2 border-gray-200  p-6 flex flex-col items-center text-center hover:shadow-2xl transition-shadow duration-300"
          >
            <img
              src={box.img}
              alt={box.title}
              className="h-48 w-full rounded-lg object-contain mb-4"
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              {box.title}
            </h3>
            <p className="text-gray-600 text-sm text-start">{box.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
