import React from 'react';
import { Container } from 'reactstrap';
import SidebarComponent from '../components/SidebarComponent';
import ImagesList from '../components/ImagesList';

class ImageCollectionPage extends React.Component {

  render() {
    const images = [{name: "Image1", file: "stuff", description: "This is an image of a castle", "date-added": "28/1/2019"}, {name: "Image2", file: "Other Stuff", description: "This is an image of a forest", "date-added": "27/1/2019"}];

    const topContent = (
      <div>Top Content</div>
    )

    const botContent = (
      <div>Bot Content</div>
    )

    const mainContent = (
      <div>
        <h1>Image Page</h1>
        <ImagesList images={images} />
      </div>
    )

    return (
      <Container fluid={true}>
        <SidebarComponent topTitle="Collections" botTitle="Search" topContent={topContent} botContent={botContent} mainContent={mainContent} />
      </Container>
    )
  }
}

export default ImageCollectionPage;