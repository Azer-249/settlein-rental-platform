import { useState } from "react";
import "./FaqSection.css";

const faqData = [
  {
    question: "How does SettleIn match renters with homes?",
    answer:
      "Renters complete a short preference survey about budget, location, lifestyle, and property needs. SettleIn then shows property cards that fit those preferences.",
  },
  {
    question: "What happens when I show interest in a property?",
    answer:
      "The owner receives your interest request. If they approve it, you can see their contact information and continue the conversation.",
  },
  {
    question: "Can I edit my preferences later?",
    answer:
      "Yes. Renters can update their preferences from the renter main page, then continue browsing with the new preferences.",
  },
  {
    question: "Why does my property need moderator approval?",
    answer:
      "Moderator review helps keep listings clear, safe, and useful. A property becomes visible to renters only after it is approved.",
  },
  {
    question: "What happens if my property is rejected?",
    answer:
      "The owner sees the rejection reason, can edit the property, and can submit it again for another moderator review.",
  },
  {
    question: "Can I pause my property listing?",
    answer:
      "Yes. Owners can pause an approved property so it stops appearing in renter feeds.",
  },
];

function FaqSection() {
  const [openIndices, setOpenIndices] = useState([0]);

  function toggleFAQ(index) {
    setOpenIndices((currentIndices) =>
      currentIndices.includes(index)
        ? currentIndices.filter((currentIndex) => currentIndex !== index)
        : [...currentIndices, index],
    );
  }

  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="faq-heading">
        <p className="eyebrow">Questions renters and owners ask</p>
        <h2 id="faq-title">Frequently asked questions</h2>
      </div>

      <div className="faq-list">
        {faqData.map((faq, index) => {
          const isOpen = openIndices.includes(index);

          return (
            <article
              className={`faq-item ${isOpen ? "open" : ""}`}
              key={faq.question}
            >
              <h3 id={`faq-heading-${index}`}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="faq-icon"
                    aria-hidden="true"
                  >
                    <path d="M40.421 215.579H471.579C493.868 215.579 512 233.711 512 256s-18.132 40.421-40.421 40.421H40.421C18.132 296.421 0 278.289 0 256s18.132-40.421 40.421-40.421z" />
                    <path
                      className="faq-icon-plus"
                      d="M215.579 40.421C215.579 18.132 233.711 0 256 0s40.421 18.132 40.421 40.421v431.158C296.421 493.868 278.289 512 256 512s-40.421-18.132-40.421-40.421V40.421z"
                    />
                  </svg>
                </button>
              </h3>

              <div
                id={`faq-panel-${index}`}
                role="region"
                aria-labelledby={`faq-heading-${index}`}
                aria-hidden={!isOpen}
                className="faq-answer-wrap"
              >
                <p className="faq-answer">{faq.answer}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default FaqSection;
