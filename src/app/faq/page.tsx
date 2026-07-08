import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import FAQPage from "../../views/clients/FAQ";

export const metadata: Metadata = buildPageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Madadgaar property, loans, installments, and insurance services in Pakistan.",
  path: "/faq",
});

const generalFAQs = [
    {
      question: "What is Madadgaar?",
      answer: "Madadgaar is a digital platform that allows users across Pakistan to compare and explore multiple options for property, loans, installment plans, and insurance services. Our mission is to simplify complex decisions, making processes transparent, clear, and easy."
    },
    {
      question: "How does Madadgaar help me make better decisions?",
      answer: "By consolidating multiple options in one platform, Madadgaar allows you to compare features, prices, and benefits side by side, helping you understand choices clearly and act with confidence."
    },
    {
      question: "Is Madadgaar free to use?",
      answer: "Yes, browsing, comparing, and submitting requests on Madadgaar is free. Any service-specific costs are clearly communicated during the process."
    },
    {
      question: "Which services are available on Madadgaar?",
      answer: "Currently, we offer: Property (buying, selling, renting), Loans and financing solutions, Installment-based purchase options, Insurance support and claim assistance."
    },
    {
      question: "Can I compare multiple options at the same time?",
      answer: "Absolutely! You can view and evaluate multiple options side by side to find what fits your needs and budget best."
    },
    {
      question: "Is Madadgaar available across Pakistan?",
      answer: "Yes, we support users nationwide, covering major cities and regions."
    },
    {
      question: "Do I need to register to use Madadgaar?",
      answer: "You can explore information without registering. Registration is required to submit requests, save preferences, or track progress."
    },
    {
      question: "How secure is my personal information?",
      answer: "Security is a top priority. All data is handled according to our Privacy and Data Protection Policies, using secure systems and controlled access."
    },
    {
      question: "Does Madadgaar provide financial advice?",
      answer: "We provide structured information and comparison tools to guide informed decisions. Users should review all details carefully before proceeding."
    },
    {
      question: "How long does it take to get a response after submitting a request?",
      answer: "Response times vary by service type. Madadgaar ensures timely processing and provides clear updates throughout the process."
    },
    {
      question: "Can businesses also use Madadgaar?",
      answer: "Yes, our platform is suitable for individuals, families, and businesses seeking property, financial, installment, or insurance-related solutions."
    },
    {
      question: "Why should I choose Madadgaar over other platforms?",
      answer: "Madadgaar offers: Ease of use, Clear comparisons, Transparent processes, Multiple services in one platform, Nationwide reach."
    },
    {
      question: "How do I get started?",
      answer: "Select your desired service, explore available options, and submit your request. Madadgaar guides you step by step from start to finish."
    },
    {
      question: "Is Madadgaar constantly improving its services?",
      answer: "Yes, we regularly enhance our platform based on user feedback, market trends, and technological advancements."
    },
    {
      question: "Where can I find more information about policies and terms?",
      answer: "Review our Terms & Conditions and Privacy Policy directly on the website for complete details about usage, data protection, and platform guidelines."
    },
    {
      question: "Can I contact Madadgaar for support?",
      answer: "Yes, our support team is available via email, phone, or live chat to assist with any queries or issues."
    }
  ];

  const propertyFAQs = [
    {
      question: "How can I find properties for sale or rent in Pakistan?",
      answer: "Use Madadgaar to compare properties across Pakistan. Filter by city, location, price, and type to find the best option for buying, renting, or investment."
    },
    {
      question: "Can I compare multiple properties at once?",
      answer: "Yes, you can compare features, prices, areas, and amenities side by side."
    },
    {
      question: "Does Madadgaar provide verified property listings?",
      answer: "Yes, all listings are verified to ensure accurate information."
    },
    {
      question: "Can I search for commercial properties or plots?",
      answer: "Absolutely! We provide residential, commercial, and plot options with clear pricing, area, and possession details."
    },
    {
      question: "Can I schedule property visits through Madadgaar?",
      answer: "Yes, once you select a property, you can request a visit directly through the platform."
    }
  ];

  const loanFAQs = [
    {
      question: "What types of loans can I compare on Madadgaar?",
      answer: "Home loans, personal loans, business loans, auto loans, and other financing solutions from verified providers across Pakistan."
    },
    {
      question: "How do I know which loan is suitable for me?",
      answer: "Our comparison tools allow you to evaluate interest rates, fees, repayment plans, and eligibility criteria to choose the best option."
    },
    {
      question: "Can I apply for a loan directly through Madadgaar?",
      answer: "Yes, submit your request via the platform to connect with verified lenders."
    },
    {
      question: "Are loan offers updated in real-time?",
      answer: "Yes, our platform provides up-to-date rates, fees, and availability."
    },
    {
      question: "Is there any hidden fee when applying through Madadgaar?",
      answer: "No, all applicable fees are clearly disclosed before you submit any application."
    }
  ];

  const installmentFAQs = [
    {
      question: "What products can I buy on installment through Madadgaar?",
      answer: "Electronics, furniture, home appliances, machinery, and other consumer goods."
    },
    {
      question: "How are EMI options displayed?",
      answer: "Monthly installments, tenure, interest rates, and total cost are clearly shown for easy comparison."
    },
    {
      question: "Can I apply for multiple installment products at the same time?",
      answer: "Yes, compare and apply for multiple products side by side."
    },
    {
      question: "Are installment plans available nationwide?",
      answer: "Yes, across all major cities in Pakistan."
    },
    {
      question: "Can I modify my EMI plan after approval?",
      answer: "Yes, subject to provider terms, you may adjust tenure or installments with provider approval."
    }
  ];

  const insuranceFAQs = [
    {
      question: "What types of insurance can I compare on Madadgaar?",
      answer: "Life, health, motor, travel, property, and Takaful plans from verified providers."
    },
    {
      question: "Can Madadgaar help with insurance claims?",
      answer: "Yes, we provide guidance on claims, including documentation, timelines, and status tracking."
    },
    {
      question: "How do I know which insurance plan is suitable?",
      answer: "Use our comparison tools to evaluate premiums, coverage, claim settlement times, and benefits."
    },
    {
      question: "Are insurance services available across Pakistan?",
      answer: "Yes, including major cities like Lahore, Karachi, Islamabad, and Rawalpindi."
    },
    {
      question: "Can I track my insurance claim online?",
      answer: "Yes, real-time claim tracking is available for all supported insurance plans."
    },
    {
      question: "Can I renew or upgrade my insurance policy via Madadgaar?",
      answer: "Yes, you can manage renewals and upgrades directly through the platform."
    }
  ];

  // Create FAQ Schema
  const allFAQs = [
    ...generalFAQs,
    ...propertyFAQs,
    ...loanFAQs,
    ...installmentFAQs,
    ...insuranceFAQs
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };


export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQPage 
        generalFAQs={generalFAQs}
        propertyFAQs={propertyFAQs}
        loanFAQs={loanFAQs}
        installmentFAQs={installmentFAQs}
        insuranceFAQs={insuranceFAQs}
      />
    </>
  );
}
