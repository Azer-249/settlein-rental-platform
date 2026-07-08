import stockImg1 from "../../assets/stock-img1.jpg";
import stockImg2 from "../../assets/stock-img2.jpg";
import stockImg3 from "../../assets/stock-img3.jpg";

const previewHomes = [
  {
    title: "Bright apartment",
    location: "Tbilisi, Saburtalo",
    rent: "GEL 1,200",
    rooms: "2 rooms",
    size: "75 m2",
    image: stockImg1,
  },
  {
    title: "Quiet city home",
    location: "Tbilisi, Vake",
    rent: "GEL 1,650",
    rooms: "3 rooms",
    size: "98 m2",
    image: stockImg2,
  },
  {
    title: "Cozy studio",
    location: "Tbilisi, Vera",
    rent: "GEL 850",
    rooms: "Studio",
    size: "42 m2",
    image: stockImg3,
  },
];

function PreviewHomes() {
  return (
    <div className="hero-card-stack" aria-label="Preview property cards">
      {previewHomes.map((home, index) => (
        <article
          className={`preview-card preview-card-${index}`}
          key={home.title}
        >
          <div className="preview-card-image">
            <img src={home.image} alt={home.title} />
            <span>{home.rent}</span>
          </div>
          <div className="preview-card-body">
            <h2>{home.title}</h2>
            <p>{home.location}</p>
            <div className="preview-card-meta">
              <span>{home.rooms}</span>
              <span>{home.size}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default PreviewHomes;
