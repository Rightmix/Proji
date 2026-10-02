import { Link } from 'react-router-dom'
import { BowlSurface } from '../ui'
import { MEAL_CATEGORIES } from '../../features/meals/categories'

export function CategoryCircles() {
  return (
    <ul className="grid grid-cols-4 gap-x-2 gap-y-3">
      {MEAL_CATEGORIES.slice(0, 8).map((c) => (
        <li key={c.id}>
          <Link
            to={`/categories/${c.id}`}
            className="flex flex-col items-center gap-1 rounded-md text-center text-xs font-medium"
          >
            <span className="grid size-14 place-items-center overflow-hidden rounded-pill bg-[#efe9df] shadow-card">
              {c.icon ? (
                <img
                  src={c.icon}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  className="size-14 object-cover"
                />
              ) : (
                <BowlSurface className="w-9" />
              )}
            </span>
            <span className="leading-tight">{c.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
