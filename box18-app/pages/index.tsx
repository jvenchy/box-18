"use client";

import Image from "next/image";
import { DM_Sans } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type Audience = "player" | "club" | "recruiter";

type FormAnswers = {
  audience?: Audience;
  ftfEvent?: string;
  gradClass?: string;
  ambitions: string[];
  clubRecording?: string;
  clubSize?: string;
  clubShowcases?: string;
  university?: string;
  recruitingMethod?: string;
  recruitingRegions: string[];
  city?: string;
  email?: string;
};

type SingleChoiceQuestion = {
  id: keyof FormAnswers;
  title: string;
  eyebrow: string;
  options: { label: string; value: string; description?: string }[];
};

const audienceOptions: { label: string; value: Audience; description: string }[] = [
  {
    label: "Player",
    value: "player",
    description: "Build your profile and get discovered from your match footage.",
  },
  {
    label: "Club",
    value: "club",
    description: "Turn recorded games into recruiter-ready player intelligence.",
  },
  {
    label: "Recruiter",
    value: "recruiter",
    description: "Find verified talent faster across leagues, events, and clubs.",
  },
];

const playerQuestions: SingleChoiceQuestion[] = [
  {
    id: "ftfEvent",
    eyebrow: "Player profile",
    title: "Have you attended an FTF or showcase event?",
    options: [
      { label: "Yes, last 12 months", value: "Yes, last 12 months" },
      { label: "Yes, earlier", value: "Yes, not in last 12 months" },
      { label: "Never", value: "Never" },
      { label: "Planning to", value: "Planning to" },
    ],
  },
  {
    id: "gradClass",
    eyebrow: "Recruiting timeline",
    title: "What graduation class are you?",
    options: ["2026", "2027", "2028", "2029", "2030", "2031+"].map((year) => ({
      label: year,
      value: year,
    })),
  },
];

const clubQuestions: SingleChoiceQuestion[] = [
  {
    id: "clubRecording",
    eyebrow: "Club setup",
    title: "How are your games usually recorded?",
    options: [
      { label: "Veo or Pixellot", value: "Automated camera" },
      { label: "Camera operator", value: "Camera operator" },
      { label: "Phone/basic camera", value: "Phone or basic camera" },
      { label: "Not recording yet", value: "Not recording yet" },
    ],
  },
  {
    id: "clubSize",
    eyebrow: "Club profile",
    title: "Which best describes your club?",
    options: [
      { label: "Local club", value: "Local club" },
      { label: "Regional academy", value: "Regional academy" },
      { label: "League1 / elite", value: "League1 or elite" },
      { label: "Multi-team org", value: "Multi-team organization" },
    ],
  },
  {
    id: "clubShowcases",
    eyebrow: "Exposure",
    title: "Do you host or attend showcases?",
    options: [
      { label: "Yes, host", value: "Host showcases" },
      { label: "Yes, attend", value: "Attend showcases" },
      { label: "Sometimes", value: "Sometimes" },
      { label: "Not yet", value: "Not yet" },
    ],
  },
];

const recruiterQuestions: SingleChoiceQuestion[] = [
  {
    id: "recruitingMethod",
    eyebrow: "Recruiting workflow",
    title: "How do you recruit today?",
    options: [
      { label: "Showcases", value: "Showcases" },
      { label: "Club referrals", value: "Club referrals" },
      { label: "Video review", value: "Video review" },
      { label: "Mixed approach", value: "Mixed approach" },
    ],
  },
];

const ambitions = [
  "Play university soccer in Canada",
  "Play university soccer in the US",
  "Play professionally",
];

const recruitingRegions = [
  "Ontario",
  "Canada-wide",
  "United States",
  "International",
];

const initialAnswers: FormAnswers = {
  ambitions: [],
  recruitingRegions: [],
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/waitlist/count")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (typeof data?.count === "number") {
          setWaitlistCount(data.count);
        }
      })
      .catch(() => setWaitlistCount(null));
  }, [submitted]);

  const steps = useMemo(() => {
    const base = [
      {
        kind: "audience" as const,
        eyebrow: "Join the waitlist",
        title: "Which best describes you?",
      },
    ];

    if (answers.audience === "player") {
      return [
        ...base,
        ...playerQuestions.map((question) => ({ kind: "single" as const, ...question })),
        {
          kind: "multi" as const,
          id: "ambitions" as const,
          eyebrow: "Ambition",
          title: "What are your ambitions in soccer?",
          options: ambitions,
        },
        {
          kind: "text" as const,
          id: "city" as const,
          eyebrow: "Location",
          title: "What city are you based in?",
          placeholder: "Toronto",
        },
        {
          kind: "email" as const,
          id: "email" as const,
          eyebrow: "Early access",
          title: "Where should we send your invite?",
          placeholder: "you@example.com",
        },
      ];
    }

    if (answers.audience === "club") {
      return [
        ...base,
        ...clubQuestions.map((question) => ({ kind: "single" as const, ...question })),
        {
          kind: "text" as const,
          id: "city" as const,
          eyebrow: "Location",
          title: "What city is your club based in?",
          placeholder: "Mississauga",
        },
        {
          kind: "email" as const,
          id: "email" as const,
          eyebrow: "Early access",
          title: "Where should we send your invite?",
          placeholder: "director@club.com",
        },
      ];
    }

    if (answers.audience === "recruiter") {
      return [
        ...base,
        {
          kind: "text" as const,
          id: "university" as const,
          eyebrow: "Program",
          title: "What university are you with?",
          placeholder: "University of Toronto",
        },
        ...recruiterQuestions.map((question) => ({ kind: "single" as const, ...question })),
        {
          kind: "multi" as const,
          id: "recruitingRegions" as const,
          eyebrow: "Recruiting map",
          title: "Where do you recruit from?",
          options: recruitingRegions,
        },
        {
          kind: "email" as const,
          id: "email" as const,
          eyebrow: "Early access",
          title: "Where should we send your invite?",
          placeholder: "coach@university.edu",
        },
      ];
    }

    return base;
  }, [answers.audience]);

  const currentStep = steps[Math.min(step, steps.length - 1)];
  const canGoBack = step > 0 && !submitted;
  const countText =
    waitlistCount === null
      ? "Join the Box18 waitlist"
      : `Join ${waitlistCount.toLocaleString()} others on the Box18 waitlist`;

  const selectAnswer = (id: keyof FormAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const selectAudience = (audience: Audience) => {
    setAnswers({ ...initialAnswers, audience });
    setStep(1);
  };

  const toggleArrayAnswer = (id: "ambitions" | "recruitingRegions", value: string) => {
    setAnswers((current) => {
      const selected = current[id];
      return {
        ...current,
        [id]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
  };

  const closeForm = () => {
    setIsOpen(false);
    setStep(0);
    setAnswers(initialAnswers);
    setSubmitError("");
    setSubmitted(false);
  };

  const submitWaitlist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setSubmitError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className={`${dmSans.variable} min-h-screen relative font-sans`}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url(/background/background3.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(91,141,184,0.22),transparent_38%)]" />
      </div>

      <header className="absolute left-0 right-0 top-0 z-20 px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Image
            src="/logos/box18-text-logo.png"
            alt="Box18"
            width={118}
            height={42}
            priority
            className="h-auto w-24 sm:w-28"
          />
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/20 sm:px-5"
          >
            Join the waitlist
          </button>
        </div>
      </header>

      <main className="flex min-h-screen items-center px-4 pb-12 pt-28 sm:px-8 sm:py-24">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-7 sm:gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:gap-12">
          <div className="max-w-5xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-5xl text-[2.85rem] font-semibold leading-[0.96] tracking-tight text-white min-[420px]:text-[3.2rem] sm:text-6xl lg:text-7xl xl:text-8xl"
            >
              The new way to recruit youth soccer talent.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:mt-7 sm:text-xl sm:leading-8"
            >
              Box18 turns match footage into player profiles, performance signals, and better
              connections between players, clubs, and recruiters.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
            >
              <button
                onClick={() => setIsOpen(true)}
                className="w-full max-w-[19rem] rounded-full bg-white px-8 py-4 text-base font-bold text-black shadow-2xl shadow-black/30 transition hover:bg-white/90 sm:w-auto"
              >
                Join the waitlist
              </button>
              <p className="text-sm font-medium text-white/70">{countText}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-visual relative mx-auto -mt-1 min-h-[330px] w-full max-w-[340px] sm:mt-0 sm:min-h-[430px] sm:max-w-[460px] lg:min-h-[500px] lg:max-w-[520px]"
          >
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <motion.div
              animate={{ y: [-10, 12, -10], rotate: [-2, 2, -2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-8 sm:inset-0"
            >
              <div className="hero-sheen" />
              <Image
                src="/hero-image.png"
                alt="Box18 hero visual"
                fill
                priority
                sizes="(min-width: 1024px) 520px, (min-width: 640px) 460px, 276px"
                className="object-contain object-center drop-shadow-[0_30px_70px_rgba(0,0,0,0.42)]"
              />
            </motion.div>
            <div className="hero-chip left-0 top-4 sm:left-0 sm:top-16">ML tracking</div>
            <div className="hero-chip right-0 top-32 sm:top-28">Recruiter ready</div>
            <div className="hero-chip bottom-4 left-8 sm:bottom-20 sm:left-8">Live signals</div>
          </motion.div>
        </section>
      </main>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Footage, models, and player intelligence in one loop.
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="w-fit rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
            >
              Join the waitlist
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {[
              {
                src: "/images/pitch.png",
                alt: "Soccer pitch analysis",
                label: "Match context",
              },
              {
                src: "/images/heatmap.png",
                alt: "Player heatmap analytics",
                label: "Movement signals",
              },
              {
                src: "/images/labeling.png",
                alt: "Soccer footage model labeling",
                label: "Model training",
              },
            ].map((image) => (
              <div
                key={image.src}
                className="group overflow-hidden rounded-lg border border-white/12 bg-white/[0.04]"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="border-t border-white/10 px-4 py-3">
                  <p className="text-sm font-semibold text-white/72">{image.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch"
        >
          <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-white/12 bg-white/[0.04] sm:min-h-[460px]">
            <Image
              src="/lybi.jpeg"
              alt="Box18 team at the Launch Your Big Idea competition"
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="rounded-lg border border-white/12 bg-white/[0.08] p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8fbce0]">
              Launch Your Big Idea
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
              Box18 took home 1st place.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/68">
              We won the Launch Your Big Idea competition for the Box18 vision, earning the
              1st place prize and $10,000 to keep building the future of youth soccer recruiting.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-3xl font-semibold">$10K</p>
                <p className="mt-2 text-sm text-white/52">Prize funding</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-3xl font-semibold">1st</p>
                <p className="mt-2 text-sm text-white/52">Place finish</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="mt-10 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition hover:bg-white/90"
            >
              Join the waitlist
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-white/12 bg-white/[0.06] p-6 text-white backdrop-blur-xl sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div>
              <Image
                src="/logos/box18-text-logo.png"
                alt="Box18"
                width={118}
                height={42}
                className="h-auto w-28"
              />
            </div>

            <p className="max-w-4xl text-sm leading-6 text-white/58 lg:justify-self-center lg:whitespace-nowrap">
              Building the next layer of youth soccer recruiting with match footage, analytics,
              and verified player signals.
            </p>

            <div className="text-sm lg:text-right">
              <div>
                <p className="font-semibold text-white">Social</p>
                <div className="mt-4 flex flex-col gap-3 text-white/56">
                  <a
                    href="https://www.linkedin.com/company/box18/"
                    className="transition hover:text-white"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Box18. All rights reserved.</p>
            <button onClick={() => setIsOpen(true)} className="w-fit rounded-full bg-white px-5 py-2.5 font-semibold text-black transition hover:bg-white/90">
              Join the waitlist
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="relative w-full max-w-2xl rounded-lg border border-white/15 bg-[#090b0d]/95 p-5 text-white shadow-2xl sm:p-7"
            >
              <button
                onClick={closeForm}
                aria-label="Close waitlist form"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl leading-none text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                x
              </button>

              {submitted ? (
                <div className="px-2 py-16 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8fbce0]">
                    You are on the list
                  </p>
                  <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                    We will send your invite soon.
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-white/62">
                    Thanks for helping shape the earliest version of Box18.
                  </p>
                  <button
                    onClick={closeForm}
                    className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90"
                  >
                    Back to landing page
                  </button>
                </div>
              ) : (
                <form onSubmit={submitWaitlist}>
                  <div className="mb-8 pr-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8fbce0]">
                      {currentStep.eyebrow}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                      {currentStep.title}
                    </h2>
                  </div>

                  <div className="min-h-[260px]">
                    {currentStep.kind === "audience" && (
                      <div className="grid gap-3 sm:grid-cols-3">
                        {audienceOptions.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => selectAudience(option.value)}
                            className="group min-h-44 rounded-lg border border-white/12 bg-white/[0.06] p-5 text-left transition hover:-translate-y-1 hover:border-[#8fbce0]/70 hover:bg-white/[0.1]"
                          >
                            <span className="text-xl font-semibold">{option.label}</span>
                            <span className="mt-4 block text-sm leading-6 text-white/58 group-hover:text-white/78">
                              {option.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {currentStep.kind === "single" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {currentStep.options.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => selectAnswer(currentStep.id, option.value)}
                            className="min-h-28 rounded-lg border border-white/12 bg-white/[0.06] p-5 text-left transition hover:-translate-y-1 hover:border-[#8fbce0]/70 hover:bg-white/[0.1]"
                          >
                            <span className="text-lg font-semibold">{option.label}</span>
                            {option.description && (
                              <span className="mt-2 block text-sm text-white/58">
                                {option.description}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {currentStep.kind === "multi" && (
                      <div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {currentStep.options.map((option) => {
                            const isSelected = answers[currentStep.id].includes(option);
                            return (
                              <button
                                type="button"
                                key={option}
                                onClick={() => toggleArrayAnswer(currentStep.id, option)}
                                className={`min-h-28 rounded-lg border p-5 text-left transition hover:-translate-y-1 ${
                                  isSelected
                                    ? "border-[#8fbce0] bg-[#8fbce0]/18"
                                    : "border-white/12 bg-white/[0.06] hover:border-[#8fbce0]/70 hover:bg-white/[0.1]"
                                }`}
                              >
                                <span className="text-lg font-semibold">{option}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          disabled={answers[currentStep.id].length === 0}
                          onClick={() => setStep((current) => current + 1)}
                          className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Continue
                        </button>
                      </div>
                    )}

                    {(currentStep.kind === "text" || currentStep.kind === "email") && (
                      <div>
                        <input
                          type={currentStep.kind === "email" ? "email" : "text"}
                          required
                          autoFocus
                          value={(answers[currentStep.id] as string | undefined) ?? ""}
                          onChange={(event) =>
                            setAnswers((current) => ({
                              ...current,
                              [currentStep.id]: event.target.value,
                            }))
                          }
                          placeholder={currentStep.placeholder}
                          className="w-full rounded-lg border border-white/12 bg-white/[0.06] px-5 py-5 text-lg text-white outline-none transition placeholder:text-white/28 focus:border-[#8fbce0]"
                        />
                        {submitError && (
                          <p className="mt-4 text-sm font-medium text-red-200">{submitError}</p>
                        )}
                        <button
                          type={currentStep.kind === "email" ? "submit" : "button"}
                          disabled={
                            isSubmitting ||
                            !String(answers[currentStep.id] ?? "").trim()
                          }
                          onClick={() => {
                            if (currentStep.kind === "text") {
                              setStep((current) => current + 1);
                            }
                          }}
                          className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {currentStep.kind === "email"
                            ? isSubmitting
                              ? "Joining..."
                              : "Join waitlist"
                            : "Continue"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                    <button
                      type="button"
                      disabled={!canGoBack}
                      onClick={() => setStep((current) => Math.max(current - 1, 0))}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-white/62 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                    >
                      Back
                    </button>
                    <p className="text-sm text-white/38">
                      Step {Math.min(step + 1, steps.length)} of {steps.length}
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
