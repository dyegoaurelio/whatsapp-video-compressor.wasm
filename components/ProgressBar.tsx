import classes from "styles/progressBar.module.css";

const ProgressBar = ({
  bgcolor,
  completed,
}: {
  bgcolor: string;
  completed: number;
}) => {
  return (
    <div className={classes.container}>
      <div
        style={{ backgroundColor: bgcolor, width: `${completed}%` }}
        className={classes.filler}
      >
        <span className={classes.label}>{`${completed}%`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
