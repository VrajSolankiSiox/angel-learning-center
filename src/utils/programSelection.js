export const MAX_PROGRAM_SELECTIONS = 2;

export const CARE_PROGRAMS = ["before_care", "after_care", "before_after"];

export const CORE_CLASSROOM_PROGRAMS = [
  "little_angels",
  "tiny_explorers",
  "busy_bee",
  "little_learners",
];

export const PART_TIME_PROGRAM = "part_time";
export const PREK_PROGRAM = "prek";
export const SUMMER_CAMP_PROGRAM = "summer_camp";
export const HOLIDAY_WEEKS_PROGRAM = "holiday_weeks";

export const EMERGENCY_MEDICAL_PROGRAMS = [
  ...CARE_PROGRAMS,
  PREK_PROGRAM,
  SUMMER_CAMP_PROGRAM,
  HOLIDAY_WEEKS_PROGRAM,
];

function unique(list) {
  return [...new Set(list)];
}

function hasCareProgram(programs) {
  return (programs || []).some((id) => CARE_PROGRAMS.includes(id));
}

function getSelectedCoreClassroom(programs) {
  return (programs || []).find((id) => CORE_CLASSROOM_PROGRAMS.includes(id));
}

function hasCoreClassroomProgram(programs) {
  return !!getSelectedCoreClassroom(programs);
}

export function normalizePrograms(selected) {
  let programs = unique((selected || []).filter(Boolean));

  const selectedCare = programs.filter((id) => CARE_PROGRAMS.includes(id));
  if (selectedCare.length) {
    return [selectedCare[selectedCare.length - 1]];
  }

  let selectedCore = getSelectedCoreClassroom(programs);
  if (selectedCore) {
    programs = programs.filter((id) => id === selectedCore || id === PART_TIME_PROGRAM);
    if (programs.length === 1 && programs[0] === PART_TIME_PROGRAM) {
      return [];
    }
    return programs.slice(0, MAX_PROGRAM_SELECTIONS);
  }

  const selectedCoreList = programs.filter((id) => CORE_CLASSROOM_PROGRAMS.includes(id));
  if (selectedCoreList.length > 1) {
    const keep = selectedCoreList[selectedCoreList.length - 1];
    programs = programs.filter((id) => !CORE_CLASSROOM_PROGRAMS.includes(id) || id === keep);
  }

  if (programs.includes(SUMMER_CAMP_PROGRAM) || programs.includes(HOLIDAY_WEEKS_PROGRAM)) {
    programs = programs.filter(
      (id) => id === SUMMER_CAMP_PROGRAM || id === HOLIDAY_WEEKS_PROGRAM
    );
    if (programs.includes(HOLIDAY_WEEKS_PROGRAM) && !programs.includes(SUMMER_CAMP_PROGRAM)) {
      programs.unshift(SUMMER_CAMP_PROGRAM);
    }
    return programs.slice(0, MAX_PROGRAM_SELECTIONS);
  }

  if (programs.includes(PREK_PROGRAM)) {
    programs = programs.filter((id) => id === PREK_PROGRAM);
  }

  if (programs.length > MAX_PROGRAM_SELECTIONS) {
    programs = programs.slice(0, MAX_PROGRAM_SELECTIONS);
  }

  if (programs.length === 1 && programs[0] === PART_TIME_PROGRAM) {
    return [];
  }

  return programs;
}

export function isProgramVisible(programId, selected) {
  const programs = normalizePrograms(selected);
  const set = new Set(programs);

  if (hasCareProgram(programs)) {
    return CARE_PROGRAMS.includes(programId);
  }

  if (hasCoreClassroomProgram(programs)) {
    return CORE_CLASSROOM_PROGRAMS.includes(programId) || programId === PART_TIME_PROGRAM;
  }

  const inSeasonalMode =
    set.has(SUMMER_CAMP_PROGRAM) || set.has(HOLIDAY_WEEKS_PROGRAM);

  if (inSeasonalMode) {
    return programId === SUMMER_CAMP_PROGRAM || programId === HOLIDAY_WEEKS_PROGRAM;
  }

  if (set.has(PREK_PROGRAM)) {
    return programId === PREK_PROGRAM;
  }

  if (programId === HOLIDAY_WEEKS_PROGRAM) {
    return set.has(SUMMER_CAMP_PROGRAM);
  }

  return true;
}

export function isProgramDisabled(programId, selected) {
  const programs = normalizePrograms(selected);
  const set = new Set(programs);

  if (set.has(programId)) return false;

  if (hasCareProgram(programs)) {
    return !CARE_PROGRAMS.includes(programId);
  }

  if (CARE_PROGRAMS.includes(programId)) {
    return false;
  }

  const selectedCore = getSelectedCoreClassroom(programs);
  if (selectedCore) {
    if (CORE_CLASSROOM_PROGRAMS.includes(programId)) {
      return programId !== selectedCore;
    }
    if (programId === PART_TIME_PROGRAM) {
      return set.has(PART_TIME_PROGRAM);
    }
    return true;
  }

  if (set.size >= MAX_PROGRAM_SELECTIONS) return true;

  if (programId === PART_TIME_PROGRAM) {
    return ![...set].some((id) => id !== PART_TIME_PROGRAM);
  }

  if (set.has(PREK_PROGRAM)) {
    return programId !== PREK_PROGRAM;
  }

  if (programId === PREK_PROGRAM) {
    return [...set].some(
      (id) =>
        CORE_CLASSROOM_PROGRAMS.includes(id) ||
        id === PART_TIME_PROGRAM ||
        id === SUMMER_CAMP_PROGRAM ||
        id === HOLIDAY_WEEKS_PROGRAM
    );
  }

  if (set.has(SUMMER_CAMP_PROGRAM) || set.has(HOLIDAY_WEEKS_PROGRAM)) {
    return programId !== SUMMER_CAMP_PROGRAM && programId !== HOLIDAY_WEEKS_PROGRAM;
  }

  if (programId === SUMMER_CAMP_PROGRAM || programId === HOLIDAY_WEEKS_PROGRAM) {
    return [...set].some(
      (id) =>
        CORE_CLASSROOM_PROGRAMS.includes(id) ||
        id === PART_TIME_PROGRAM ||
        id === PREK_PROGRAM
    );
  }

  return false;
}

export function toggleProgram(selected, programId) {
  const programs = normalizePrograms(selected);
  const set = new Set(programs);

  if (set.has(programId)) {
    set.delete(programId);
    if (programId === SUMMER_CAMP_PROGRAM) {
      set.delete(HOLIDAY_WEEKS_PROGRAM);
    }
    return normalizePrograms(Array.from(set));
  }

  if (isProgramDisabled(programId, programs)) {
    return programs;
  }

  if (programId === SUMMER_CAMP_PROGRAM) {
    const next = [SUMMER_CAMP_PROGRAM];
    if (set.has(HOLIDAY_WEEKS_PROGRAM)) next.push(HOLIDAY_WEEKS_PROGRAM);
    return normalizePrograms(next);
  }

  if (programId === HOLIDAY_WEEKS_PROGRAM) {
    return normalizePrograms([SUMMER_CAMP_PROGRAM, HOLIDAY_WEEKS_PROGRAM]);
  }

  if (programId === PREK_PROGRAM) {
    return normalizePrograms([PREK_PROGRAM]);
  }

  if (CARE_PROGRAMS.includes(programId)) {
    return normalizePrograms([programId]);
  }

  if (CORE_CLASSROOM_PROGRAMS.includes(programId)) {
    const keepPartTime = set.has(PART_TIME_PROGRAM);
    return normalizePrograms(keepPartTime ? [programId, PART_TIME_PROGRAM] : [programId]);
  }

  set.add(programId);
  return normalizePrograms(Array.from(set));
}

export function validatePrograms(selected) {
  const programs = normalizePrograms(selected);

  if (!programs.length) {
    return "Select at least one program.";
  }

  if (programs.length === 1 && programs[0] === PART_TIME_PROGRAM) {
    return "Part-time Stars cannot be selected alone. Choose another program first.";
  }

  if (programs.length > MAX_PROGRAM_SELECTIONS) {
    return `Select up to ${MAX_PROGRAM_SELECTIONS} programs.`;
  }

  return null;
}

export function needsEmergencyMedicalForm(selected) {
  const programs = normalizePrograms(selected);
  return programs.some((id) => EMERGENCY_MEDICAL_PROGRAMS.includes(id));
}

/** School transport agreement — before / after / before & after care only. */
export function needsTransportForm(selected) {
  const programs = normalizePrograms(selected);
  return programs.some((id) => CARE_PROGRAMS.includes(id));
}
