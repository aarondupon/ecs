export const info = (message,color='green') =>{
    let skin = ['#f9fff9','#228B22']
    switch (color) {
        case 'green':
            
            break;
        case 'blue':
            skin = ['#eaf9fe','#1bc1f5']
        break;
        case 'yellow':
        skin = ['#FAFAD2','#ffff00']
        break;
        default:
            break;
    }
    return console.info(`%c ${message} `, `background:${skin[0]};display: block; color: ${skin[1]}`);
}
   
    
