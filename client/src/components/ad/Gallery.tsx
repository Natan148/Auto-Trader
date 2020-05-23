/* eslint react/prop-types: 0 */
import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import Fade from '@material-ui/core/Fade';
import ImageGallery from 'react-image-gallery';

interface GalleryItem {
  original: string;
  thumbnail: string;
}

interface Props {
  photos: string[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      backgroundColor: '#313c53',
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      width: '80%',
    },
  })
);

const Gallery: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { photos } = props;
  const [openGallery, setOpenGallery] = useState(false);
  const [hoverOnImg, setHoverOnImg] = useState(false);

  const createGallery = () => {
    const gallery: GalleryItem[] = [];
    photos.map((photo) => {
      gallery.push({
        original: photo,
        thumbnail: photo,
      });
    });
    return gallery;
  };

  const handleOpenGallery = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setOpenGallery(true);
  };

  const handleCloseGallery = () => {
    setOpenGallery(false);
  };

  return (
    <React.Fragment>
      <div className="photosCounter">
        <PhotoCameraIcon />
        <label>{photos.length}</label>
      </div>
      <div
        className="photosBtn"
        onMouseOver={() => setHoverOnImg(true)}
        onMouseLeave={() => setHoverOnImg(false)}
      >
        {photos[1] && hoverOnImg && (
          <div className="hoverOnImgDiv" onClick={(e) => handleOpenGallery(e)}>
            <IconButton aria-haspopup="true" color="inherit">
              <PhotoLibraryIcon fontSize="large" />
            </IconButton>
          </div>
        )}
        <img
          className="mainImg"
          src={
            photos.length === 0
              ? 'https://i.pinimg.com/originals/85/49/dd/8549ddae0806d4f4f10383f1031538c1.jpg'
              : photos[1]
          }
          alt="There is no photos"
        />
      </div>
      <div>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={openGallery}
          onClose={handleCloseGallery}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={openGallery}>
            <div className={classes.paper}>
              <ImageGallery items={createGallery()} />
            </div>
          </Fade>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default Gallery;
