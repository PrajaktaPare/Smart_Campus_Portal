import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';

const CourseMaterials = () => {
  const { courseId } = useParams(); // Get courseId from URL

  return (
    <>
      <Navbar />
      <Container fluid className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold text-center">
              Course Materials
            </h1>
            <p className="text-muted text-center">
              Materials for Course ID: {courseId}
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={{ span: 8, offset: 2 }}>
            <Card className="shadow-sm rounded-4">
              <Card.Body>
                <Card.Title className="fw-semibold">
                  Course Materials (Coming Soon)
                </Card.Title>
                <p>
                  This section will display course materials such as lecture notes, assignments, and resources for the selected course.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default CourseMaterials;
