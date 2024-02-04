import React, {useEffect, useState} from 'react';
import s from './styles.module.css';
import tank from '../../assets/tank.png';
import bullet from '../../assets/bullet.png';

const Main = () => {
    const [position, setPosition] = useState({top: 0, left: 0});
    const tankSize = 150;
    const [projectiles, setProjectiles] = useState([]);
    const [key, setKey] = useState('');
    const [randomSquares, setRandomSquares] = useState([]);
    const [point, setPoint] = useState(0)

    const addProjectile = () => {
        const tankCenterX = position.left + tankSize / 2;
        const tankCenterY = position.top + tankSize / 2;

        const angle = (key === 'w' && -Math.PI / 2) || // Прямо
            (key === 'a' && Math.PI) || // Налево
            (key === 's' && Math.PI / 2) || // Назад
            (key === 'd' && 0) || // Направо
            0;

        const speed = 5;

        const newProjectile = {
            top: tankCenterY,
            left: tankCenterX,
            angle,
            speed,
            position: {
                top:
                    (key === 'w' && '0px') ||
                    (key === 'd' && '-20px') ||
                    (key === 's' && '0px') ||
                    (key === 'a' && '-30px') ||
                    0,
                left:
                    (key === 'w' && '-20px') ||
                    (key === 'd' && '0px') ||
                    (key === 's' && '-30px') ||
                    (key === 'a' && '0px') ||
                    0,
                rotate: (key === 's' && 180) ||
                    (key === 'w' && 0) ||
                    (key === 'a' && 270) ||
                    (key === 'd' && 90) ||
                    0
            }
        };

        setProjectiles((prevProjectiles) => [...prevProjectiles, newProjectile]);
    };

    const generateRandomSquares = () => {
        const numberOfSquares = 5; // Вы можете изменить количество квадратов
        const squares = [];

        for (let i = 0; i < numberOfSquares; i++) {
            const randomTop = Math.floor(Math.random() * window.innerHeight);
            const randomLeft = Math.floor(Math.random() * window.innerWidth);

            squares.push({
                id: i,
                top: randomTop,
                left: randomLeft,
                width: 30, // Размер квадрата
                height: 30,
            });
        }

        setRandomSquares(squares);
    };

    useEffect(() => {
        const projectileAnimation = setInterval(() => {
            setProjectiles((prevProjectiles) =>
                prevProjectiles.map((projectile) => {
                    const newTop = projectile.top + projectile.speed * Math.sin(projectile.angle);
                    const newLeft = projectile.left + projectile.speed * Math.cos(projectile.angle);

                    // Проверка столкновения с квадратами
                    const collidedSquare = randomSquares.find(
                        (square) =>
                            newTop >= square.top &&
                            newTop <= square.top + square.height &&
                            newLeft >= square.left &&
                            newLeft <= square.left + square.width
                    );

                    if (collidedSquare) {
                        // Если есть столкновение, удаляем снаряд и квадрат из состояний
                        setRandomSquares((prevSquares) =>
                            prevSquares.filter((square) => square.id !== collidedSquare.id)
                        );
                        setPoint(point + 10)
                        return null;
                    }

                    // Проверка выхода за границы экрана
                    if (
                        newTop < 0 ||
                        newLeft < 0 ||
                        newTop > window.innerHeight ||
                        newLeft > window.innerWidth
                    ) {
                        return null;
                    }

                    return {...projectile, top: newTop, left: newLeft};
                }).filter((projectile) => projectile !== null)
            );
        }, 20);

        return () => clearInterval(projectileAnimation);
    }, [randomSquares]);

    useEffect(() => {
        document.addEventListener('click', addProjectile);

        return () => {
            document.removeEventListener('click', addProjectile);
        };
    }, [position]);
    useEffect(() => {
        // Генерируем рандомные квадраты
        generateRandomSquares();
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            switch (e.key) {
                case 'w':
                    setPosition((prevPosition) => ({...prevPosition, top: Math.max(0, prevPosition.top - 10)}));
                    setKey(e.key);
                    break;
                case 'a':
                    setPosition((prevPosition) => ({...prevPosition, left: Math.max(0, prevPosition.left - 10)}));
                    setKey(e.key);
                    break;
                case 's':
                    setPosition((prevPosition) => ({
                        ...prevPosition,
                        top: Math.min(window.innerHeight - tankSize, prevPosition.top + 10),
                    }));
                    setKey(e.key);
                    break;
                case 'd':
                    setPosition((prevPosition) => ({
                        ...prevPosition,
                        left: Math.min(window.innerWidth - tankSize, prevPosition.left + 10),
                    }));
                    setKey(e.key);
                    break;
                default:
                    break;
            }
        };


        document.addEventListener('keypress', handleKeyPress);

        return () => {
            document.removeEventListener('keypress', handleKeyPress);
        };
    }, []);

    return (
        <div className={s.main}>

            <div className={s.info}>
                <p>{`point: ${point}`}</p>

                <button onClick={generateRandomSquares}>update squares</button>
            </div>
            {projectiles.map((projectile, index) => (
                <div
                    key={index}
                    className={s.arm}
                    style={{
                        position: 'absolute',
                        top: projectile.top,
                        left: projectile.left,
                        width: '25px',
                        height: '50px',
                        // background: 'red',
                        // borderRadius: '50%',
                    }}
                >
                    <img style={{
                        transform: `rotate(${projectile?.position?.rotate}deg)`,
                        left: projectile?.position?.left,
                        top: projectile?.position?.top,
                    }} className={s.bullet} src={bullet} alt=""/>
                </div>
            ))}

            {randomSquares.map((square, index) => (
                <div
                    key={index}
                    className={s.randomSquare}
                    style={{
                        position: 'absolute',
                        top: square.top,
                        left: square.left,
                        width: '30px',
                        height: '30px',
                        background: 'blue', // Цвет квадрата
                    }}
                />
            ))}
            <div
                className={s.tank}
                style={{
                    width: tankSize,
                    height: tankSize,
                    top: position.top,
                    left: position.left,
                    transform: `rotate(${
                        (key === 's' && '-90deg') ||
                        (key === 'w' && '90deg') ||
                        (key === 'a' && '0deg') ||
                        (key === 'd' && '180deg') ||
                        0
                    })`,
                }}
            >

                <img src={tank} alt="tank"/>
            </div>
        </div>
    );
};

export default Main;
