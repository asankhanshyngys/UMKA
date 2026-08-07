-- Safe, repeatable sample content for the English Grammar Beginner course.
-- Uses fixed development IDs so it can be run more than once.

INSERT INTO "Video" ("id", "title", "description", "storageKey", "duration", "price", "order", "isFreePreview", "moduleId", "createdAt", "updatedAt")
SELECT 'sample-grammar-daily-routines', 'Present Simple: Daily Routines', 'Talk about what you do every day.', 'videos/test-lesson.mp4', 420, 2490, 2, false, "id", NOW(), NOW()
FROM "Module"
WHERE "title" = 'Present Simple'
  AND "courseId" = (SELECT "id" FROM "Course" WHERE "slug" = 'english-grammar-beginner')
  AND NOT EXISTS (SELECT 1 FROM "Video" WHERE "id" = 'sample-grammar-daily-routines');

INSERT INTO "Video" ("id", "title", "description", "storageKey", "duration", "price", "order", "isFreePreview", "moduleId", "createdAt", "updatedAt")
SELECT 'sample-grammar-negatives', 'Present Simple: Negatives', 'Use don''t and doesn''t correctly.', 'videos/test-lesson.mp4', 420, 2490, 3, false, "id", NOW(), NOW()
FROM "Module"
WHERE "title" = 'Present Simple'
  AND "courseId" = (SELECT "id" FROM "Course" WHERE "slug" = 'english-grammar-beginner')
  AND NOT EXISTS (SELECT 1 FROM "Video" WHERE "id" = 'sample-grammar-negatives');

INSERT INTO "Video" ("id", "title", "description", "storageKey", "duration", "price", "order", "isFreePreview", "moduleId", "createdAt", "updatedAt")
SELECT 'sample-grammar-questions', 'Present Simple: Questions', 'Ask clear everyday questions with do and does.', 'videos/test-lesson.mp4', 420, 2490, 4, false, "id", NOW(), NOW()
FROM "Module"
WHERE "title" = 'Present Simple'
  AND "courseId" = (SELECT "id" FROM "Course" WHERE "slug" = 'english-grammar-beginner')
  AND NOT EXISTS (SELECT 1 FROM "Video" WHERE "id" = 'sample-grammar-questions');

INSERT INTO "Practice" ("id", "title", "category", "moduleId", "videoId", "createdAt", "updatedAt")
SELECT 'sample-practice-daily-routines', 'Daily routines practice', 'VOCABULARY', "moduleId", "id", NOW(), NOW()
FROM "Video" WHERE "id" = 'sample-grammar-daily-routines'
  AND NOT EXISTS (SELECT 1 FROM "Practice" WHERE "id" = 'sample-practice-daily-routines');

INSERT INTO "Practice" ("id", "title", "category", "moduleId", "videoId", "createdAt", "updatedAt")
SELECT 'sample-practice-negatives', 'Negative sentences practice', 'GRAMMAR', "moduleId", "id", NOW(), NOW()
FROM "Video" WHERE "id" = 'sample-grammar-negatives'
  AND NOT EXISTS (SELECT 1 FROM "Practice" WHERE "id" = 'sample-practice-negatives');

INSERT INTO "Practice" ("id", "title", "category", "moduleId", "videoId", "createdAt", "updatedAt")
SELECT 'sample-practice-questions', 'Questions practice', 'GRAMMAR', "moduleId", "id", NOW(), NOW()
FROM "Video" WHERE "id" = 'sample-grammar-questions'
  AND NOT EXISTS (SELECT 1 FROM "Practice" WHERE "id" = 'sample-practice-questions');

INSERT INTO "PracticeSection" ("id", "title", "practiceId", "order") VALUES
  ('sample-section-daily-routines', 'Quick check', 'sample-practice-daily-routines', 1),
  ('sample-section-negatives', 'Quick check', 'sample-practice-negatives', 1),
  ('sample-section-questions', 'Quick check', 'sample-practice-questions', 1)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Question" ("id", "text", "type", "order", "sectionId") VALUES
  ('sample-question-daily-routines', 'Choose the correct sentence.', 'MULTIPLE_CHOICE', 1, 'sample-section-daily-routines'),
  ('sample-question-negatives', 'Complete the sentence: He ___ like coffee.', 'FILL_BLANK', 1, 'sample-section-negatives'),
  ('sample-question-questions', 'Put the words in the correct order.', 'WORD_ORDER', 1, 'sample-section-questions')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Answer" ("id", "text", "correct", "questionId") VALUES
  ('sample-answer-daily-1', 'She goes to work at 9.', true, 'sample-question-daily-routines'),
  ('sample-answer-daily-2', 'She go to work at 9.', false, 'sample-question-daily-routines'),
  ('sample-answer-daily-3', 'She going to work at 9.', false, 'sample-question-daily-routines'),
  ('sample-answer-negative-1', 'doesn''t', true, 'sample-question-negatives'),
  ('sample-answer-question-1', 'Where do you live?', true, 'sample-question-questions')
ON CONFLICT ("id") DO NOTHING;
