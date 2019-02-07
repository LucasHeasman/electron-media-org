import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, CardImg } from 'reactstrap';

class ImagesList extends React.Component {
  render() {
    let cards;
    if (this.props && this.props.images && this.props.images.length) {
      cards = (this.props.images).map((object, index) => {
        let imageDescription = object.description;
        if (imageDescription && imageDescription.length > 30) {
          imageDescription = imageDescription.substring(0, 30);
          imageDescription += '...';
        }
        return (
          <Col xs="3" key={object.fileName}>
            <Card className="imageCard">
              <CardImg top src={object.src} alt="Image" />
              <CardBody>
                <CardTitle>{object.fileName || ''}</CardTitle>
                <CardText>{imageDescription || ''}</CardText>
                <CardText>
                  <small className="text-muted">{object.dateAdded || ''}</small>
                </CardText>
              </CardBody>
            </Card>
          </Col>
        )
      });
    } else {
      cards = <div>No images found</div>
    }

    return (
      <Container fluid={true}>
        <Row>
          {cards}
        </Row>
      </Container>
    )
  }
}

export default ImagesList;
