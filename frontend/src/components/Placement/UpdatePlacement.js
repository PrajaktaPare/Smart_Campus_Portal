import { Container, Row, Col, Card } from 'react-bootstrap';
import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';

const UpdatePlacement = () => {
  return (
    <>
      <Navbar />
      <Container fluid className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="display-5 fw-bold text-center">
              Update Placement
            </h1>
            <p className="text-muted text-center">
              Update your placement status
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={{ span: 8, offset: 2 }}>
            <Card className="shadow-sm rounded-4">
              <Card.Body>
                <Card.Title className="fw-semibold">
                  Update Placement (Coming Soon)
                </Card.Title>
                <p>
                  This section will allow you to update your placement status, such as applying to new companies or marking a placement as accepted.
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

export default UpdatePlacement;
