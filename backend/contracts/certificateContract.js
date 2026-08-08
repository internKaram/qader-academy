
const buildCertificateRequestBody = ({ studentId, courseId }) => ({
  studentId,
  courseId,
  // If she confirms `student`/`course` instead, change ONLY this object to:
  // student: studentId,
  // course: courseId,
});
 

const isLikelyDuplicateResponse = (responseOrError) => {
  const status = responseOrError.status || responseOrError.response?.status;
  const body = responseOrError.data || responseOrError.response?.data || {};
  const message = (body.message || '').toLowerCase();
 
  return (
    status === 409 ||
    body.isNewlyIssued === false ||
    body.code === 11000 ||
    /e11000|duplicate|already (exists|issued)/i.test(message)
  );
};
 
module.exports = { buildCertificateRequestBody, isLikelyDuplicateResponse };