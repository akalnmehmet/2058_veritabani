// Path: @/components/mycomponents/Header.tsx
const Header = ({ title, classname }) => {
  return (
          <div className={`flex items-center p-3 ${classname}`}>
            <h2 className='font-roboto text-3xl font-bold'>{title}</h2>
          </div >
  );
};

export default Header;
