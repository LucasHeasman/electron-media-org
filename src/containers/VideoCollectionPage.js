import React from 'react';
import { Container } from 'reactstrap';
import SidebarComponent from '../components/SidebarComponent';

class VideoCollectionPage extends React.Component {
  render() {
    const topContent = (
      <div>Top Content</div>
    )

    const botContent = (
      <div>Bot Content</div>
    )

    const mainContent = (
      <h1>Video Page</h1>
    )

    return (
      <Container>
        <SidebarComponent topTitle="Playlists" botTitle="Search" topContent={topContent} botContent={botContent} mainContent={mainContent} />
      </Container>
    )
  }

}

export default VideoCollectionPage;