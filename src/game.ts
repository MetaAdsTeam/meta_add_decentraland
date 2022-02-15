import * as utils from '@dcl/ecs-scene-utils'

var amount_of_screens = 3

var screens: Array<Entity> = []
var numbers_of_screens: Array<number> = [1, 5, 6]

var scale = new Vector3(8, 4.5, 1)

var positions: Array<Vector3> = [
    new Vector3(15, 1 + scale.y / 2, 4 + scale.x / 2),
    new Vector3(8, 1 + scale.y / 2, 15),
    new Vector3(1, 1 + scale.y / 2, 4 + scale.x / 2),
]
var image_rotations: Array<Quaternion> = [
    new Quaternion(360, 1, 360, 1),
    new Quaternion(0, -1, -360, 1),
    new Quaternion(-360, -1, 360, -1),
]
var video_rotations: Array<Quaternion> = [
    new Quaternion(0, -1, 0, 1),
    new Quaternion(0, 1, 0, 0),
    new Quaternion(0, 1, 0, 1),
]

var video_textures: Array<VideoTexture> = []
var materials: Array<Material> = []

var update_dates: Array<null | Date> = []

for (let i = 0; i < amount_of_screens; i++){
    screens.push(new Entity())
    screens[i].addComponent(new PlaneShape())
    screens[i].addComponent(
        new Transform({            
            scale: scale,
            position: positions[i],
            rotation: image_rotations[i],
        })
    )
    
    materials.push(new Material())
    materials[i].roughness = 1
    materials[i].specularIntensity = 0
    materials[i].metallic = 0

    update_dates.push(null)

    video_textures.push(new VideoTexture(new VideoClip('')))
}


function create_display(stream: any, num_of_screen: number){
    let rotation: Quaternion
    if (stream.is_image){
        materials[num_of_screen].albedoTexture = new Texture(stream.url)
        
        if (video_textures[num_of_screen] && video_textures[num_of_screen].playing){
            video_textures[num_of_screen].pause()
        }
        
        rotation = image_rotations[num_of_screen]
    }
    else {
        video_textures[num_of_screen] = new VideoTexture(new VideoClip(stream.url)) 
        video_textures[num_of_screen].loop = true
        materials[num_of_screen].albedoTexture = video_textures[num_of_screen]
        
        video_textures[num_of_screen].play()
        
        rotation = video_rotations[num_of_screen]
    }
    
    screens[num_of_screen].addComponentOrReplace(
        new Transform({            
            scale: scale,
            position: positions[num_of_screen],
            rotation: rotation,
        })
    )
    screens[num_of_screen].addComponentOrReplace(materials[num_of_screen])
}


function date_without_timezone(string_date: string) {
    let date = new Date(string_date)
    if (date == null) return date
    var timestamp = date.getTime() - date.getTimezoneOffset() * 60000
    var correctDate = new Date(timestamp)
    return correctDate
}


function get_default_image_json(){
    return {
        'is_image': true,
        'url': 'https://metaads.team/data/default.png'
    }
}


async function get_data(num_of_screen: number) {
    let url = "https://metaads.team/tornado/adspot/id/" + numbers_of_screens[num_of_screen].toString() + "/stream"
    log(url)
    let json = await utils.sendRequest(url, 'GET')
    
    let message = json.msg
    if (message){
        // 404 
        if (message == 'There are no stream now'){
            update_dates[num_of_screen] = null
            json = get_default_image_json()
            log(num_of_screen+1 + ' -- ' + 'Nothing to show at the moment')
        }
        // 200
        if (message == 'ok'){
            update_dates[num_of_screen] = date_without_timezone(json.to_time)
            log(num_of_screen+1 + ' -- ' + (json.is_image ? 'Image' : 'Video') + ' was got')
        }
    }
    // nothing was returned
    else {
        update_dates[num_of_screen] = null
        json = get_default_image_json()
        log(num_of_screen+1 + 'API doesn\'t respond')
    }
    create_display(json, num_of_screen)
}


let checker = new Entity()
engine.addEntity(checker)
checker.addComponent(
    new utils.Interval(5000, () => {
        let now = new Date();
        for (let i = 0; i < amount_of_screens; i++){
            if (update_dates[i] == null || update_dates[i] < now){
                executeTask(async () => {
                    await get_data(i)
                })
            }
        }
    })
)

for (let i = 0; i < amount_of_screens; i++){
    engine.addEntity(screens[i])
}
