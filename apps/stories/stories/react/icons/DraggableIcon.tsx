import draggableIcon from '../../assets/draggableIcon.svg';

export const DraggableIcon = () => (
  <img
    src={draggableIcon}
    width="140"
    alt="Draggable"
    draggable={false}
    style={{pointerEvents: 'none'}}
  />
);
