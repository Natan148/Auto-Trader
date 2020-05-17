/* eslint react/prop-types: 0 */
import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import CancelIcon from '@material-ui/icons/Cancel';
import Container from '@material-ui/core/Container/Container';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import ImageGallery from 'react-image-gallery';
import '../../node_modules/react-image-gallery/styles/css/image-gallery.css';
import './ad.css';
import { AdDetails } from './ad.interface';

interface Props {
  details: AdDetails;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(25),
      flexBasis: '33.33%',
      flexShrink: 0,
      display: 'inline-table',
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
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

interface GalleryItem {
  original: string;
  thumbnail: string;
}

const Ad: React.FC<Props> = (props) => {
  const details = props.details;
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [open, setOpen] = React.useState(false);

  const createGallery = () => {
    const gallery: GalleryItem[] = [];
    details.photos.map((photo) => {
      gallery.push({
        original: photo,
        thumbnail: photo,
      });
    });
    return gallery;
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (panel: string) => (
    event: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container
      style={{
        width: '800px',
      }}
    >
      <div className={classes.root}>
        <ExpansionPanel
          expanded={expanded === 'panel1'}
          onChange={handleChange('panel1')}
        >
          <ExpansionPanelSummary
            // expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className="photosCounter">
              <PhotoCameraIcon />
              <label>{details.photos.length}</label>
            </div>
            <img
              className="mainImg"
              src={details.photos[1]}
              alt="There is no photos"
              onClick={(e) => handleOpen(e)}
            />
            <Typography className={classes.heading}>
              {details.make} | {details.model}
              <div className="price">
                <h2 id="priceText">{details.price}</h2>
                <AttachMoneyIcon fontSize="large" />
              </div>
            </Typography>
            {/* <Typography className={classes.secondaryHeading}>
              I am an expansion panel
            </Typography> */}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
              feugiat. Aliquam eget maximus est, id dignissim quam.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
      <div>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <div className={classes.paper}>
              <CancelIcon />
              <ImageGallery items={createGallery()} />
            </div>
          </Fade>
        </Modal>
      </div>
    </Container>
  );
};

export default Ad;
