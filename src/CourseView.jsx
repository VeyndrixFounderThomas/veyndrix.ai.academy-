import React from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Circle, Clock3, GraduationCap, LockKeyhole } from "lucide-react";
import { course } from "./course";

export default function CourseView({ onBack }) {
  const [moduleIndex, setModuleIndex] = React.useState(0);
  const [lessonIndex, setLessonIndex] = React.useState(-1);
  // Preview progress is saved only in this browser. Account sync will replace this
  // temporary storage once the academy's dedicated Supabase project is connected.
  const [completed, setCompleted] = React.useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("veyndrix-academy-preview-progress") || "[]");
      return Array.isArray(saved) ? saved.filter(item => typeof item === "string") : [];
    } catch {
      return [];
    }
  });
  const [showOutline, setShowOutline] = React.useState(true);
  const currentModule = course.modules[moduleIndex];
  const currentLesson = lessonIndex >= 0 ? currentModule.lessons[lessonIndex] : null;
  const total = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const done = completed.length;
  React.useEffect(() => {
    try {
      window.localStorage.setItem("veyndrix-academy-preview-progress", JSON.stringify(completed));
    } catch {
      // The course remains usable if browser storage is unavailable.
    }
  }, [completed]);
  const key = (m, l) => m + "-" + l;
  const isDone = lessonIndex >= 0 && completed.includes(key(moduleIndex, lessonIndex));
  const selectLesson = (m, l) => { setModuleIndex(m); setLessonIndex(l); };
  const selectModule = (m) => { setModuleIndex(m); setLessonIndex(-1); };
  const move = (direction) => {
    let m = moduleIndex, l = lessonIndex < 0 ? (direction > 0 ? 0 : -1) : lessonIndex + direction;
    if (l < 0) { if (m === 0) return; m -= 1; l = course.modules[m].lessons.length - 1; }
    if (l >= course.modules[m].lessons.length) { if (m === course.modules.length - 1) return; m += 1; l = 0; }
    selectLesson(m, l);
  };
  const toggleDone = () => setCompleted(old => isDone ? old.filter(item => item !== key(moduleIndex, lessonIndex)) : [...old, key(moduleIndex, lessonIndex)]);
  return <div className="learning-shell">
    <header className="learning-header">
      <button className="back-link" onClick={onBack}><ArrowLeft size={17}/> Academy home</button>
      <a className="brand" href="#home"><span className="mark"><GraduationCap/></span><span><b>Veyndrix</b><small>AI ACADEMY</small></span></a>
      <span className="preview-label"><LockKeyhole size={13}/> COURSE PREVIEW</span>
    </header>
    <div className="course-banner">
      <div className="eyebrow"><i/> FLAGSHIP PROGRAM</div>
      <h1>{course.title}</h1>
      <p>{course.subtitle}</p>
      <div className="course-meta"><span><BookOpen size={15}/>{course.format}</span><span><GraduationCap size={15}/>{course.level}</span></div>
      <section className="outcomes-panel" aria-label="Course learning outcomes">
        <h2>What you'll be able to do</h2>
        <ul>{course.outcomes.map((outcome) => <li key={outcome}><CheckCircle2 size={15}/>{outcome}</li>)}</ul>
      </section>
    </div>
    <div className="learning-layout">
      <aside className={showOutline ? "lesson-sidebar open" : "lesson-sidebar"}>
        <div className="sidebar-title"><b>Course content</b><span>{done}/{total} complete</span></div>
        <div className="progress-track"><span style={{width: (done/total*100)+"%"}}/></div>
        {course.modules.map((module, m) => <section className="module-group" key={module.title}>
          <button className="module-heading" onClick={() => selectModule(m)}><span><small>MODULE {String(m+1).padStart(2,"0")}</small><b>{module.title}</b></span><ChevronRight size={16}/></button>
          {module.lessons.map((lesson, l) => <button className={"lesson-link "+(m===moduleIndex&&l===lessonIndex?"active":"")} key={lesson.title} onClick={() => selectLesson(m,l)}>
            {completed.includes(key(m,l)) ? <CheckCircle2 size={15}/> : <Circle size={15}/>}<span>{lesson.title}</span>
          </button>)}
        </section>)}
      </aside>
      <main className="lesson-main">
        <button className="outline-toggle" onClick={() => setShowOutline(!showOutline)}><BookOpen size={15}/>{showOutline?"Hide course outline":"Show course outline"}<ChevronDown size={15}/></button>
        {lessonIndex < 0 ? <div className="module-overview">
          <div className="lesson-kicker">MODULE {String(moduleIndex+1).padStart(2,"0")} <span>/</span> MODULE OVERVIEW</div>
          <h2>{currentModule.title}</h2>
          <p className="module-intro">{currentModule.intro}</p>
          <section className="module-learning-card"><div className="exercise-label"><GraduationCap size={16}/> WHAT YOU'LL LEARN</div><p>Work through the lessons below in order. Each lesson introduces a practical concept, explains how to apply it in a small-business setting, and gives you an activity to complete. Keep your work—you'll use it in your final business portfolio.</p></section>
          <h3 className="module-lessons-heading">Lessons in this module</h3>
          <div className="module-lesson-list">{currentModule.lessons.map((lesson,l)=><button className="module-lesson-card" key={lesson.title} onClick={()=>selectLesson(moduleIndex,l)}><span className="module-lesson-number">{String(l+1).padStart(2,"0")}</span><span className="module-lesson-details"><b>{lesson.title}</b><small>{lesson.time} · Learning material and practical activity</small></span>{completed.includes(key(moduleIndex,l))?<CheckCircle2 size={18}/>:<ArrowRight size={18}/>}</button>)}</div>
          <button className="primary-action module-start" onClick={()=>selectLesson(moduleIndex,0)}>Start first lesson <ArrowRight size={16}/></button>
        </div> : <>
          <div className="lesson-kicker">MODULE {String(moduleIndex+1).padStart(2,"0")} <span>/</span> LESSON {lessonIndex+1} OF {currentModule.lessons.length}</div>
          <h2>{currentLesson.title}</h2>
          <div className="lesson-time"><Clock3 size={15}/>{currentLesson.time} estimated</div>
          <p className="module-intro">{currentModule.intro}</p>
          <div className="lesson-copy"><h3>Lesson</h3><p>{currentLesson.body}</p><h3>Why this matters</h3><p>Apply this concept to a real business problem. Start with verified information, write down assumptions, and decide how you will check whether the result is useful. AI can help you draft and explore options, but you remain responsible for reviewing the work before using it with customers.</p></div>
          <section className="exercise-card"><div className="exercise-label"><BookOpen size={16}/> YOUR PRACTICE</div><h3>Put it into action</h3><p>{currentLesson.task}</p></section>
          <div className="lesson-actions">
            <button className="secondary-action" onClick={() => lessonIndex===0 ? selectModule(moduleIndex) : move(-1)}><ArrowLeft size={16}/> {lessonIndex===0?"Module overview":"Previous"}</button>
            <button className={isDone?"complete-action done":"complete-action"} onClick={toggleDone}>{isDone?<CheckCircle2 size={16}/>:<Circle size={16}/>} {isDone?"Completed":"Mark complete"}</button>
            <button className="primary-action" onClick={() => move(1)} disabled={moduleIndex===course.modules.length-1&&lessonIndex===currentModule.lessons.length-1}>Next lesson <ArrowRight size={16}/></button>
          </div>
          <p className="preview-note"><LockKeyhole size={14}/> Preview mode: completed lessons are saved in this browser on this device. They are not connected to a student account and will not sync across devices. Enrollment, assessments, and certificates are not active.</p>
        </>}
      </main>
    </div>
    <footer className="learning-footer"><span>VEYNDRIX AI ACADEMY</span><span>LEARN. BUILD. INNOVATE.</span></footer>
  </div>;
}